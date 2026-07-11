package com.propertymasters.app.data.model

data class Property(
    val id: String,
    val title: String,
    val location: String,
    val price: String,
    val imageUrl: String,
    val beds: Int,
    val baths: Int,
    val areaSqft: Int,
    val category: String,
    val isFeatured: Boolean = false
)
