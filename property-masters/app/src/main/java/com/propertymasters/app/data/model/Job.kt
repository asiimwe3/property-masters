package com.propertymasters.app.data.model

data class Job(
    val id: String,
    val title: String,
    val company: String,
    val location: String,
    val jobType: String,
    val salary: String,
    val category: String,
    val postedDaysAgo: Int,
    val description: String = "",
    val requirements: List<String> = emptyList(),
    val responsibilities: List<String> = emptyList(),
    val contactEmail: String = "",
    val contactPhone: String = "",
    val logoUrl: String = ""
)
