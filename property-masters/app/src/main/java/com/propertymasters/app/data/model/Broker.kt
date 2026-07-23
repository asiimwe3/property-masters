package com.propertymasters.app.data.model

data class Broker(
    val id: String,
    val name: String,
    val specialty: String,
    val rating: Double,
    val reviewCount: Int,
    val photoUrl: String,
    val listingsCount: Int,
    val bio: String = "",
    val phone: String = "",
    val email: String = "",
    val experienceYears: Int = 0,
    val languages: List<String> = emptyList(),
    val areasServed: List<String> = emptyList()
)
