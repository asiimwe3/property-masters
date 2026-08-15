package com.propertymasters.app.data.repository

import android.util.Log
import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.data.model.UserProfile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder

/**
 * Supabase-backed repository. Uses direct REST API calls to Supabase
 * for auth, database (PostgREST), and storage. Falls back to MockDataRepository
 * on network errors.
 *
 * Supabase tables: properties, brokers, transactions, ledger_entries,
 *                  contact_messages, property_viewings
 */
object SupabaseRepository {

    private const val TAG = "SupabaseRepo"

    // ── Supabase config ──────────────────────────────────────────
    private const val SUPABASE_URL = "https://eiyexnuhqdscomilwpqg.supabase.co"
    private const val SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWV4bnVocWRzY29taWx3cHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwOTQyNzMsImV4cCI6MjA5NTY3MDI3M30.e2KGeOLpJ41NyNjgI_EY8ZZYgG5pTTxnhLRNnHPmKRs"
    private const val SERVICE_ROLE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWV4bnVocWRzY29taWx3cHFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5NDI3MywiZXhwIjoyMDk1NjcwMjczfQ.d8hxdHNZxpF9tCZaI-jb_69CfbqGYgdZLRdkTMPD4kc"

    var useMockData = false
        private set

    // ── Auth state ───────────────────────────────────────────────
    private var accessToken: String? = null
    private var refreshToken: String? = null

    val isSignedIn: Boolean get() = accessToken != null

    // ── HTTP helper ──────────────────────────────────────────────

    private fun authHeaders(token: String? = null): Map<String, String> {
        val headers = mutableMapOf(
            "apikey" to SUPABASE_ANON_KEY,
            "Content-Type" to "application/json"
        )
        if (token != null) {
            headers["Authorization"] = "Bearer $token"
        } else {
            headers["Authorization"] = "Bearer $SERVICE_ROLE_KEY"
        }
        return headers
    }

    private suspend fun httpGet(
        url: String,
        headers: Map<String, String>
    ): String? = withContext(Dispatchers.IO) {
        try {
            val conn = java.net.URL(url).openConnection() as java.net.HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 15000
            conn.readTimeout = 15000
            headers.forEach { (k, v) -> conn.setRequestProperty(k, v) }

            val code = conn.responseCode
            if (code in 200..299) {
                conn.inputStream.bufferedReader().use { it.readText() }
            } else {
                Log.w(TAG, "GET $url → $code: ${conn.errorStream?.bufferedReader()?.use { it.readText() }}")
                null
            }
        } catch (e: Exception) {
            Log.w(TAG, "GET failed: ${e.message}")
            null
        }
    }

    private suspend fun httpPost(
        url: String,
        body: String,
        headers: Map<String, String>
    ): Pair<Int, String?> = withContext(Dispatchers.IO) {
        try {
            val conn = java.net.URL(url).openConnection() as java.net.HttpURLConnection
            conn.requestMethod = "POST"
            conn.connectTimeout = 15000
            conn.readTimeout = 15000
            conn.doOutput = true
            headers.forEach { (k, v) -> conn.setRequestProperty(k, v) }

            conn.outputStream.bufferWriter().use { it.write(body) }

            val code = conn.responseCode
            val response = if (code in 200..299) {
                conn.inputStream.bufferedReader().use { it.readText() }
            } else {
                conn.errorStream?.bufferedReader()?.use { it.readText() }
            }
            code to response
        } catch (e: Exception) {
            Log.w(TAG, "POST failed: ${e.message}")
            -1 to null
        }
    }

    // ── Properties ──────────────────────────────────────────────

    suspend fun fetchProperties(): List<Property> {
        val url = "$SUPABASE_URL/rest/v1/properties" +
            "?select=id,title,description,location,price,category,images,featured,bedrooms,bathrooms,area_sqft,status" +
            "&status=eq.available&order=featured.desc&order=created_at.desc&limit=50"

        val response = httpGet(url, authHeaders())
        if (response == null) {
            useMockData = true
            return MockDataRepository.properties
        }

        return try {
            val arr = JSONArray(response)
            if (arr.length() == 0) {
                useMockData = true
                MockDataRepository.properties
            } else {
                (0 until arr.length()).mapNotNull { i ->
                    arr.getJSONObject(i).toProperty()
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Parse properties failed: ${e.message}")
            useMockData = true
            MockDataRepository.properties
        }
    }

    suspend fun addProperty(property: Property): Boolean {
        val url = "$SUPABASE_URL/rest/v1/properties"
        val body = JSONObject().apply {
            put("title", property.title)
            put("description", property.description)
            put("price", property.price.replace("[^0-9.]".toRegex(), "").toDoubleOrNull() ?: 0.0)
            put("location", property.location)
            put("category", property.category)
            put("bedrooms", property.beds)
            put("bathrooms", property.baths)
            put("area_sqft", property.areaSqft)
            put("images", JSONArray(property.galleryImages.ifEmpty { listOf(property.imageUrl) }))
            put("featured", property.isFeatured)
            put("status", property.status)
        }.toString()

        val (code, _) = httpPost(url, body, authHeaders(accessToken))
        return code in 200..299
    }

    // ── Brokers ─────────────────────────────────────────────────

    suspend fun fetchBrokers(): List<Broker> {
        val url = "$SUPABASE_URL/rest/v1/brokers" +
            "?select=id,full_name,email,phone,location,specialization,bio,photo_url,verified,registration_status" +
            "&registration_status=eq.active&limit=50"

        val response = httpGet(url, authHeaders())
        if (response == null) return MockDataRepository.brokers

        return try {
            val arr = JSONArray(response)
            if (arr.length() == 0) {
                MockDataRepository.brokers
            } else {
                (0 until arr.length()).mapNotNull { i ->
                    arr.getJSONObject(i).toBroker()
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Parse brokers failed: ${e.message}")
            MockDataRepository.brokers
        }
    }

    // ── Jobs (still from mock — no jobs table in Supabase yet) ──

    suspend fun fetchJobs(): List<Job> {
        // Jobs table not yet in Supabase — use mock data
        return MockDataRepository.jobs
    }

    // ── Auth (Supabase Auth) ────────────────────────────────────

    suspend fun signInWithEmail(email: String, password: String): Result<JSONObject> {
        val url = "$SUPABASE_URL/auth/v1/token?grant_type=password"
        val body = JSONObject().apply {
            put("email", email)
            put("password", password)
        }.toString()

        val (code, response) = httpPost(url, body, authHeaders())
        if (code in 200..299 && response != null) {
            val json = JSONObject(response)
            accessToken = json.optString("access_token", null)
            refreshToken = json.optString("refresh_token", null)
            return Result.success(json)
        }
        return Result.failure(Exception("Login failed: ${response ?: "Unknown error"}"))
    }

    suspend fun signUpWithEmail(name: String, email: String, password: String): Result<JSONObject> {
        val url = "$SUPABASE_URL/auth/v1/signup"
        val body = JSONObject().apply {
            put("email", email)
            put("password", password)
            put("data", JSONObject().put("full_name", name))
        }.toString()

        val (code, response) = httpPost(url, body, authHeaders())
        if (code in 200..299 && response != null) {
            val json = JSONObject(response)
            // Auto-sign-in if session returned
            accessToken = json.optString("access_token", null)
            refreshToken = json.optString("refresh_token", null)
            return Result.success(json)
        }
        return Result.failure(Exception("Signup failed: ${response ?: "Unknown error"}"))
    }

    fun signOut() {
        accessToken = null
        refreshToken = null
    }

    // ── Image upload (Supabase Storage) ─────────────────────────

    suspend fun uploadPropertyImage(imageBytes: ByteArray, fileName: String): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val url = "$SUPABASE_URL/storage/v1/object/property-images/$fileName"
                val conn = java.net.URL(url).openConnection() as java.net.HttpURLConnection
                conn.requestMethod = "POST"
                conn.connectTimeout = 30000
                conn.readTimeout = 30000
                conn.doOutput = true
                conn.setRequestProperty("apikey", SUPABASE_ANON_KEY)
                conn.setRequestProperty("Authorization", "Bearer ${accessToken ?: SERVICE_ROLE_KEY}")
                conn.setRequestProperty("Content-Type", "image/jpeg")
                conn.setRequestProperty("x-upsert", "true")

                conn.outputStream.write(imageBytes)

                val code = conn.responseCode
                if (code in 200..299) {
                    val publicUrl = "$SUPABASE_URL/storage/v1/object/public/property-images/$fileName"
                    Result.success(publicUrl)
                } else {
                    val err = conn.errorStream?.bufferedReader()?.use { it.readText() }
                    Log.w(TAG, "Upload failed: $code — $err")
                    Result.failure(Exception("Upload failed"))
                }
            } catch (e: Exception) {
                Log.w(TAG, "Upload exception: ${e.message}")
                Result.failure(e)
            }
        }
    }

    // ── JSON → Model mappers ────────────────────────────────────

    private fun JSONObject.toProperty(): Property {
        val images = optJSONArray("images")
        val imageList = mutableListOf<String>()
        if (images != null) {
            for (i in 0 until images.length()) {
                imageList.add(images.getString(i))
            }
        }

        val priceNum = opt("price")
        val priceStr = when (priceNum) {
            is Number -> "UGX ${"%,.0f".format(priceNum.toDouble())}"
            is String -> priceNum
            else -> "Price on request"
        }

        return Property(
            id = optString("id", ""),
            title = optString("title", ""),
            location = optString("location", ""),
            price = priceStr,
            imageUrl = imageList.firstOrNull() ?: "",
            galleryImages = imageList,
            beds = optInt("bedrooms", 0),
            baths = optInt("bathrooms", 0),
            areaSqft = optInt("area_sqft", 0),
            category = optString("category", "Residential"),
            isFeatured = optBoolean("featured", false),
            description = optString("description", ""),
            status = optString("status", "available")
        )
    }

    private fun JSONObject.toBroker(): Broker {
        return Broker(
            id = optString("id", ""),
            name = optString("full_name", optString("name", "")),
            specialty = optString("specialization", optString("specialty", "Real Estate")),
            rating = optDouble("rating", 4.5),
            reviewCount = optInt("review_count", 0),
            photoUrl = optString("photo_url", optString("photoUrl", "")),
            listingsCount = optInt("listings_count", 0),
            bio = optString("bio", ""),
            phone = optString("phone", ""),
            email = optString("email", ""),
            experienceYears = optInt("experience_years", 0),
            languages = listOf("English"), // Default
            areasServed = listOf(optString("location", "Uganda"))
        )
    }

    // ── Delegate lookups to MockDataRepository ─────────────────

    fun getPropertyById(id: String): Property? = MockDataRepository.getPropertyById(id)
    fun getBrokerById(id: String): Broker? = MockDataRepository.getBrokerById(id)
    fun getJobById(id: String): Job? = MockDataRepository.getJobById(id)
}
