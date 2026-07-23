package com.propertymasters.app.data.repository

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.QuerySnapshot
import com.google.firebase.storage.FirebaseStorage
import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.data.model.UserProfile
import kotlinx.coroutines.tasks.await

/**
 * Firebase-backed repository. Falls back to MockDataRepository when Firebase
 * is not configured (e.g. no google-services.json) or collections are empty.
 *
 * Firestore collections: properties, brokers, jobs, users
 */
object FirebaseRepository {

    private const val TAG = "FirebaseRepo"

    private val db: FirebaseFirestore? by lazy {
        try {
            FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            Log.w(TAG, "Firestore not initialized, using mock data", e)
            null
        }
    }

    private val auth: FirebaseAuth? by lazy {
        try {
            FirebaseAuth.getInstance()
        } catch (e: Exception) {
            Log.w(TAG, "Firebase Auth not initialized", e)
            null
        }
    }

    private val storage: FirebaseStorage? by lazy {
        try {
            FirebaseStorage.getInstance()
        } catch (e: Exception) {
            Log.w(TAG, "Firebase Storage not initialized", e)
            null
        }
    }

    var useMockData = false
        private set

    // ----- Properties -----

    suspend fun fetchProperties(): List<Property> {
        if (db == null) {
            useMockData = true
            return MockDataRepository.properties
        }
        return try {
            val snapshot = db!!.collection("properties").get().await()
            if (snapshot.isEmpty) {
                useMockData = true
                MockDataRepository.properties
            } else {
                snapshot.toPropertyList()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to fetch properties, using mock", e)
            useMockData = true
            MockDataRepository.properties
        }
    }

    suspend fun addPropertyToFirestore(property: Property): Boolean {
        if (db == null || useMockData) return false
        return try {
            db!!.collection("properties").document(property.id).set(property).await()
            true
        } catch (e: Exception) {
            Log.w(TAG, "Failed to add property", e)
            false
        }
    }

    // ----- Brokers -----

    suspend fun fetchBrokers(): List<Broker> {
        if (db == null) {
            return MockDataRepository.brokers
        }
        return try {
            val snapshot = db!!.collection("brokers").get().await()
            if (snapshot.isEmpty) {
                MockDataRepository.brokers
            } else {
                snapshot.toBrokerList()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to fetch brokers, using mock", e)
            MockDataRepository.brokers
        }
    }

    // ----- Jobs -----

    suspend fun fetchJobs(): List<Job> {
        if (db == null) {
            return MockDataRepository.jobs
        }
        return try {
            val snapshot = db!!.collection("jobs").get().await()
            if (snapshot.isEmpty) {
                MockDataRepository.jobs
            } else {
                snapshot.toJobList()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to fetch jobs, using mock", e)
            MockDataRepository.jobs
        }
    }

    // ----- Auth -----

    fun getCurrentFirebaseUser(): FirebaseUser? = auth?.currentUser

    suspend fun signInWithEmail(email: String, password: String): Result<FirebaseUser> {
        if (auth == null) return Result.failure(Exception("Auth not configured"))
        return try {
            val result = auth!!.signInWithEmailAndPassword(email, password).await()
            Result.success(result.user!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUpWithEmail(name: String, email: String, password: String): Result<FirebaseUser> {
        if (auth == null) return Result.failure(Exception("Auth not configured"))
        return try {
            val result = auth!!.createUserWithEmailAndPassword(email, password).await()
            // Store user profile in Firestore
            val user = result.user!!
            val profile = mapOf(
                "name" to name,
                "email" to email,
                "createdAt" to System.currentTimeMillis()
            )
            db?.collection("users")?.document(user.uid)?.set(profile)?.await()
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun signOut() {
        auth?.signOut()
    }

    // ----- Storage -----

    suspend fun uploadPropertyImage(imageBytes: ByteArray, fileName: String): Result<String> {
        if (storage == null) return Result.failure(Exception("Storage not configured"))
        return try {
            val ref = storage!!.reference.child("properties/$fileName")
            ref.putBytes(imageBytes).await()
            val url = ref.downloadUrl.await().toString()
            Result.success(url)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to upload image", e)
            Result.failure(e)
        }
    }

    // ----- Firestore mapping helpers -----

    private fun QuerySnapshot.toPropertyList(): List<Property> {
        return documents.mapNotNull { doc ->
            try {
                Property(
                    id = doc.id,
                    title = doc.getString("title") ?: "",
                    location = doc.getString("location") ?: "",
                    price = doc.getString("price") ?: "",
                    imageUrl = doc.getString("imageUrl") ?: "",
                    galleryImages = (doc.get("galleryImages") as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList(),
                    beds = (doc.getLong("beds") ?: 0).toInt(),
                    baths = (doc.getLong("baths") ?: 0).toInt(),
                    areaSqft = (doc.getLong("areaSqft") ?: 0).toInt(),
                    category = doc.getString("category") ?: "House",
                    isFeatured = doc.getBoolean("isFeatured") ?: false,
                    description = doc.getString("description") ?: "",
                    amenities = (doc.get("amenities") as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList(),
                    brokerId = doc.getString("brokerId") ?: "",
                    yearBuilt = (doc.getLong("yearBuilt") ?: 0).toInt(),
                    parking = (doc.getLong("parking") ?: 0).toInt(),
                    status = doc.getString("status") ?: "For Sale"
                )
            } catch (e: Exception) {
                Log.w(TAG, "Failed to parse property ${doc.id}", e)
                null
            }
        }
    }

    private fun QuerySnapshot.toBrokerList(): List<Broker> {
        return documents.mapNotNull { doc ->
            try {
                Broker(
                    id = doc.id,
                    name = doc.getString("name") ?: "",
                    specialty = doc.getString("specialty") ?: "",
                    rating = (doc.getDouble("rating") ?: 0.0),
                    reviewCount = (doc.getLong("reviewCount") ?: 0).toInt(),
                    photoUrl = doc.getString("photoUrl") ?: "",
                    listingsCount = (doc.getLong("listingsCount") ?: 0).toInt(),
                    bio = doc.getString("bio") ?: "",
                    phone = doc.getString("phone") ?: "",
                    email = doc.getString("email") ?: "",
                    experienceYears = (doc.getLong("experienceYears") ?: 0).toInt(),
                    languages = (doc.get("languages") as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList(),
                    areasServed = (doc.get("areasServed") as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList()
                )
            } catch (e: Exception) {
                Log.w(TAG, "Failed to parse broker ${doc.id}", e)
                null
            }
        }
    }

    private fun QuerySnapshot.toJobList(): List<Job> {
        return documents.mapNotNull { doc ->
            try {
                Job(
                    id = doc.id,
                    title = doc.getString("title") ?: "",
                    company = doc.getString("company") ?: "",
                    location = doc.getString("location") ?: "",
                    jobType = doc.getString("jobType") ?: "Full Time",
                    salary = doc.getString("salary") ?: "",
                    category = doc.getString("category") ?: "All",
                    postedDaysAgo = (doc.getLong("postedDaysAgo") ?: 0).toInt(),
                    description = doc.getString("description") ?: "",
                    requirements = (doc.get("requirements") as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList(),
                    responsibilities = (doc.get("responsibilities") as? List<*>)?.mapNotNull { it?.toString() } ?: emptyList(),
                    contactEmail = doc.getString("contactEmail") ?: "",
                    contactPhone = doc.getString("contactPhone") ?: "",
                    logoUrl = doc.getString("logoUrl") ?: ""
                )
            } catch (e: Exception) {
                Log.w(TAG, "Failed to parse job ${doc.id}", e)
                null
            }
        }
    }

    // Delegate lookups to MockDataRepository (works for both mock and Firebase data
    // since IDs match when seed data is loaded)
    fun getPropertyById(id: String): Property? = MockDataRepository.getPropertyById(id)
    fun getBrokerById(id: String): Broker? = MockDataRepository.getBrokerById(id)
    fun getJobById(id: String): Job? = MockDataRepository.getJobById(id)
    fun getPropertiesByBroker(brokerId: String): List<Property> = MockDataRepository.getPropertiesByBroker(brokerId)

    val propertyCategories = MockDataRepository.propertyCategories
    val jobCategories = MockDataRepository.jobCategories
    val currentUser = MockDataRepository.currentUser
}
