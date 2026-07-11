package com.propertymasters.app.data.repository

import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.data.model.UserProfile

/**
 * Central mock/dummy data source so every screen renders realistic content
 * without needing a live backend. Swap this out for a real API/Retrofit
 * repository later — the ViewModels only depend on this interface's shape.
 */
object MockDataRepository {

    val properties: List<Property> = listOf(
        Property(
            id = "p1",
            title = "Cozy Suburban House",
            location = "Kampala, Naguru",
            price = "\$185,000",
            imageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            beds = 3,
            baths = 2,
            areaSqft = 1450,
            category = "House",
            isFeatured = true
        ),
        Property(
            id = "p2",
            title = "Modern Downtown Condo",
            location = "Kampala, Kololo",
            price = "\$220,500",
            imageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            beds = 2,
            baths = 2,
            areaSqft = 980,
            category = "Condo",
            isFeatured = true
        ),
        Property(
            id = "p3",
            title = "Luxury Lakeside Villa",
            location = "Entebbe, Lake Victoria",
            price = "\$540,000",
            imageUrl = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
            beds = 5,
            baths = 4,
            areaSqft = 3200,
            category = "Villa",
            isFeatured = true
        ),
        Property(
            id = "p4",
            title = "Cozy Studio Apartment",
            location = "Kampala, Bugolobi",
            price = "\$78,000",
            imageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            beds = 1,
            baths = 1,
            areaSqft = 520,
            category = "Apartment"
        ),
        Property(
            id = "p5",
            title = "Family Home with Garden",
            location = "Mukono, Central",
            price = "\$165,000",
            imageUrl = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
            beds = 4,
            baths = 3,
            areaSqft = 2100,
            category = "House"
        ),
        Property(
            id = "p6",
            title = "Sleek City Loft",
            location = "Kampala, Nakasero",
            price = "\$249,000",
            imageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            beds = 2,
            baths = 1,
            areaSqft = 890,
            category = "Condo"
        ),
        Property(
            id = "p7",
            title = "Countryside Bungalow",
            location = "Jinja, Riverside",
            price = "\$132,000",
            imageUrl = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            beds = 3,
            baths = 2,
            areaSqft = 1600,
            category = "House"
        ),
        Property(
            id = "p8",
            title = "Beachfront Retreat Villa",
            location = "Entebbe, Shoreline",
            price = "\$610,000",
            imageUrl = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            beds = 6,
            baths = 5,
            areaSqft = 4100,
            category = "Villa"
        ),
    )

    val brokers: List<Broker> = listOf(
        Broker(
            id = "b1",
            name = "Alice Johnson",
            specialty = "Luxury Homes",
            rating = 4.8,
            reviewCount = 120,
            photoUrl = "https://randomuser.me/api/portraits/women/44.jpg",
            listingsCount = 32
        ),
        Broker(
            id = "b2",
            name = "David Mensah",
            specialty = "Commercial Properties",
            rating = 4.6,
            reviewCount = 98,
            photoUrl = "https://randomuser.me/api/portraits/men/32.jpg",
            listingsCount = 27
        ),
        Broker(
            id = "b3",
            name = "Grace Nakato",
            specialty = "Residential & Rentals",
            rating = 4.9,
            reviewCount = 156,
            photoUrl = "https://randomuser.me/api/portraits/women/68.jpg",
            listingsCount = 41
        ),
        Broker(
            id = "b4",
            name = "Samuel Okello",
            specialty = "New Developments",
            rating = 4.7,
            reviewCount = 84,
            photoUrl = "https://randomuser.me/api/portraits/men/76.jpg",
            listingsCount = 19
        ),
        Broker(
            id = "b5",
            name = "Patricia Achieng",
            specialty = "Luxury Homes",
            rating = 4.5,
            reviewCount = 63,
            photoUrl = "https://randomuser.me/api/portraits/women/21.jpg",
            listingsCount = 22
        ),
    )

    val jobs: List<Job> = listOf(
        Job(
            id = "j1",
            title = "Senior Real Estate Agent",
            company = "Property Masters Realty",
            location = "Kampala, Uganda",
            jobType = "Full-time",
            salary = "\$1,200 - \$2,000/mo",
            category = "Agents",
            postedDaysAgo = 2
        ),
        Job(
            id = "j2",
            title = "Junior Property Consultant",
            company = "Urban Homes Ltd",
            location = "Entebbe, Uganda",
            jobType = "Full-time",
            salary = "\$600 - \$900/mo",
            category = "Agents",
            postedDaysAgo = 5
        ),
        Job(
            id = "j3",
            title = "Construction Project Manager",
            company = "SkyLine Developers",
            location = "Kampala, Uganda",
            jobType = "Full-time",
            salary = "\$1,800 - \$2,500/mo",
            category = "Project Managers",
            postedDaysAgo = 1
        ),
        Job(
            id = "j4",
            title = "Site Project Manager",
            company = "Horizon Estates",
            location = "Jinja, Uganda",
            jobType = "Contract",
            salary = "\$1,400 - \$1,900/mo",
            category = "Project Managers",
            postedDaysAgo = 8
        ),
        Job(
            id = "j5",
            title = "Leasing Agent",
            company = "Property Masters Realty",
            location = "Mukono, Uganda",
            jobType = "Part-time",
            salary = "\$400 - \$700/mo",
            category = "Agents",
            postedDaysAgo = 3
        ),
        Job(
            id = "j6",
            title = "Property Marketing Manager",
            company = "Nile Realty Group",
            location = "Kampala, Uganda",
            jobType = "Full-time",
            salary = "\$1,000 - \$1,500/mo",
            category = "Project Managers",
            postedDaysAgo = 6
        ),
    )

    val currentUser = UserProfile(
        name = "Sarah Miller",
        email = "sarah.miller@propertymasters.com",
        photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
        isVerified = true
    )
}
