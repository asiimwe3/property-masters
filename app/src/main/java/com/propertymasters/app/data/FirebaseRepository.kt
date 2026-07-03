package com.propertymasters.app.data

import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/**
 * Live Firestore-backed repository.
 * Firestore collections expected: "properties", "brokers", "jobs"
 * Each document's fields should mirror the corresponding data class below
 * (id is taken from the document itself, not stored as a field).
 *
 * Falls back to MockData automatically if a collection is empty or a read fails,
 * so the app always has content to show (including on first run before you've
 * added real documents in the Firebase console).
 */
object FirebaseRepository {

    private val db by lazy { FirebaseFirestore.getInstance() }

    suspend fun getProperties(): List<Property> {
        return try {
            val snapshot = db.collection("properties").get().await()
            if (snapshot.isEmpty) return MockData.properties
            snapshot.documents.mapIndexedNotNull { index, doc ->
                Property(
                    id = doc.id.hashCode(),
                    title = doc.getString("title") ?: return@mapIndexedNotNull null,
                    price = doc.getString("price") ?: "",
                    imageUrl = doc.getString("imageUrl") ?: "",
                    beds = (doc.getLong("beds") ?: 0).toInt(),
                    baths = (doc.getLong("baths") ?: 0).toInt(),
                    location = doc.getString("location") ?: "",
                    category = doc.getString("category") ?: "",
                    isFeatured = doc.getBoolean("isFeatured") ?: false
                )
            }
        } catch (e: Exception) {
            MockData.properties
        }
    }

    suspend fun getBrokers(): List<Broker> {
        return try {
            val snapshot = db.collection("brokers").get().await()
            if (snapshot.isEmpty) return MockData.brokers
            snapshot.documents.mapIndexedNotNull { _, doc ->
                Broker(
                    id = doc.id.hashCode(),
                    name = doc.getString("name") ?: return@mapIndexedNotNull null,
                    specialty = doc.getString("specialty") ?: "",
                    photoUrl = doc.getString("photoUrl") ?: "",
                    rating = doc.getDouble("rating") ?: 0.0,
                    reviewCount = (doc.getLong("reviewCount") ?: 0).toInt(),
                    title = doc.getString("title") ?: ""
                )
            }
        } catch (e: Exception) {
            MockData.brokers
        }
    }

    suspend fun getJobs(): List<Job> {
        return try {
            val snapshot = db.collection("jobs").get().await()
            if (snapshot.isEmpty) return MockData.jobs
            snapshot.documents.mapIndexedNotNull { _, doc ->
                Job(
                    id = doc.id.hashCode(),
                    title = doc.getString("title") ?: return@mapIndexedNotNull null,
                    company = doc.getString("company") ?: "",
                    location = doc.getString("location") ?: "",
                    type = doc.getString("type") ?: "",
                    salary = doc.getString("salary") ?: "",
                    category = doc.getString("category") ?: ""
                )
            }
        } catch (e: Exception) {
            MockData.jobs
        }
    }

    /** Writes a new property listing submitted from within the app. */
    suspend fun addProperty(property: Property) {
        val data = hashMapOf(
            "title" to property.title,
            "price" to property.price,
            "imageUrl" to property.imageUrl,
            "beds" to property.beds,
            "baths" to property.baths,
            "location" to property.location,
            "category" to property.category,
            "isFeatured" to property.isFeatured
        )
        db.collection("properties").add(data).await()
    }
}
