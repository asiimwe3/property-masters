package com.propertymasters.app.data.repository

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.model.Property
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Seeds Firestore collections with mock data if they are empty.
 * Call this once at app startup. It checks each collection and
 * only writes if no documents exist.
 */
object FirestoreSeeder {

    private const val TAG = "FirestoreSeeder"

    fun seedIfNeeded() {
        val db = try { FirebaseFirestore.getInstance() } catch (e: Exception) { return }
        val scope = CoroutineScope(Dispatchers.IO)

        // Seed properties
        db.collection("properties").get()
            .addOnSuccessListener { snapshot ->
                if (snapshot.isEmpty) {
                    Log.i(TAG, "Seeding properties...")
                    scope.launch {
                        MockDataRepository.properties.forEach { property ->
                            val data = property.toMap()
                            db.collection("properties").document(property.id).set(data)
                        }
                    }
                }
            }
            .addOnFailureListener { Log.w(TAG, "Properties seed check failed", it) }

        // Seed brokers
        db.collection("brokers").get()
            .addOnSuccessListener { snapshot ->
                if (snapshot.isEmpty) {
                    Log.i(TAG, "Seeding brokers...")
                    scope.launch {
                        MockDataRepository.brokers.forEach { broker ->
                            val data = broker.toMap()
                            db.collection("brokers").document(broker.id).set(data)
                        }
                    }
                }
            }
            .addOnFailureListener { Log.w(TAG, "Brokers seed check failed", it) }

        // Seed jobs
        db.collection("jobs").get()
            .addOnSuccessListener { snapshot ->
                if (snapshot.isEmpty) {
                    Log.i(TAG, "Seeding jobs...")
                    scope.launch {
                        MockDataRepository.jobs.forEach { job ->
                            val data = job.toMap()
                            db.collection("jobs").document(job.id).set(data)
                        }
                    }
                }
            }
            .addOnFailureListener { Log.w(TAG, "Jobs seed check failed", it) }
    }
}

// Extension functions to convert models to Firestore-compatible maps
fun Property.toMap(): Map<String, Any?> = mapOf(
    "title" to title,
    "location" to location,
    "price" to price,
    "imageUrl" to imageUrl,
    "galleryImages" to galleryImages,
    "beds" to beds,
    "baths" to baths,
    "areaSqft" to areaSqft,
    "category" to category,
    "isFeatured" to isFeatured,
    "description" to description,
    "amenities" to amenities,
    "brokerId" to brokerId,
    "yearBuilt" to yearBuilt,
    "parking" to parking,
    "status" to status
)

fun Broker.toMap(): Map<String, Any?> = mapOf(
    "name" to name,
    "specialty" to specialty,
    "rating" to rating,
    "reviewCount" to reviewCount,
    "photoUrl" to photoUrl,
    "listingsCount" to listingsCount,
    "bio" to bio,
    "phone" to phone,
    "email" to email,
    "experienceYears" to experienceYears,
    "languages" to languages,
    "areasServed" to areasServed
)

fun Job.toMap(): Map<String, Any?> = mapOf(
    "title" to title,
    "company" to company,
    "location" to location,
    "jobType" to jobType,
    "salary" to salary,
    "category" to category,
    "postedDaysAgo" to postedDaysAgo,
    "description" to description,
    "requirements" to requirements,
    "responsibilities" to responsibilities,
    "contactEmail" to contactEmail,
    "contactPhone" to contactPhone,
    "logoUrl" to logoUrl
)
