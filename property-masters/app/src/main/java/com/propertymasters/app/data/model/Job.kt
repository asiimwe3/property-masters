package com.propertymasters.app.data.model

data class Job(
    val id: String,
    val title: String,
    val company: String,
    val location: String,
    val jobType: String,
    val salary: String,
    val category: String, // "Agents", "Project Managers", etc.
    val postedDaysAgo: Int
)
