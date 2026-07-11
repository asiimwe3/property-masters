package com.propertymasters.app.data.model

data class Broker(
    val id: String,
    val name: String,
    val specialty: String,
    val rating: Double,
    val reviewCount: Int,
    val photoUrl: String,
    val listingsCount: Int
)
