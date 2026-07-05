package com.propertymasters.app.data

data class Property(
    val id: Int,
    val docId: String = "",
    val title: String,
    val price: String,
    val imageUrl: String,
    val beds: Int,
    val baths: Int,
    val location: String,
    val category: String,
    val isFeatured: Boolean = false,
    val ownerId: String = ""
)

data class Broker(
    val id: Int,
    val name: String,
    val specialty: String,
    val photoUrl: String,
    val rating: Double,
    val reviewCount: Int,
    val title: String
)

data class Job(
    val id: Int,
    val title: String,
    val company: String,
    val location: String,
    val type: String,
    val salary: String,
    val category: String // "Agents" or "Project Managers"
)

data class Category(
    val id: Int,
    val name: String,
    val icon: String // emoji-based icon for simplicity
)

data class MenuItem(
    val label: String,
    val icon: String
)
