package com.propertymasters.app.data.model

data class Property(
    val id: String,
    val title: String,
    val location: String,
    val price: String,
    val imageUrl: String,
    val galleryImages: List<String> = emptyList(),
    val beds: Int,
    val baths: Int,
    val areaSqft: Int,
    val category: String,
    val isFeatured: Boolean = false,
    val description: String = "",
    val amenities: List<String> = emptyList(),
    val brokerId: String = "",
    val yearBuilt: Int = 0,
    val parking: Int = 0,
    val status: String = "For Sale"
)
