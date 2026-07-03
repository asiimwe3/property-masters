package com.propertymasters.app.data

object MockData {

    val categories = listOf(
        Category(1, "Apartments", "🏢"),
        Category(2, "Villas", "🏡"),
        Category(3, "Commercial", "🏬"),
        Category(4, "Plots", "📐")
    )

    val properties = listOf(
        Property(
            id = 1,
            title = "Modern Downtown Loft",
            price = "$2,480/mo",
            imageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            beds = 2, baths = 2,
            location = "Downtown, Chicago",
            category = "Apartments",
            isFeatured = true
        ),
        Property(
            id = 2,
            title = "Cozy Suburban House",
            price = "$1,880/mo",
            imageUrl = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
            beds = 3, baths = 2,
            location = "Naperville, IL",
            category = "Villas"
        ),
        Property(
            id = 3,
            title = "Luxury Condo",
            price = "$3,100/mo",
            imageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            beds = 2, baths = 2,
            location = "Lakeshore, Chicago",
            category = "Apartments"
        ),
        Property(
            id = 4,
            title = "Cozy Condo",
            price = "$1,890/mo",
            imageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            beds = 1, baths = 1,
            location = "Wicker Park, Chicago",
            category = "Apartments"
        ),
        Property(
            id = 5,
            title = "Luxury Condo Skyline",
            price = "$3,190/mo",
            imageUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            beds = 2, baths = 2,
            location = "River North, Chicago",
            category = "Apartments"
        ),
        Property(
            id = 6,
            title = "Modern Office Space",
            price = "$4,500/mo",
            imageUrl = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
            beds = 0, baths = 2,
            location = "Loop, Chicago",
            category = "Commercial"
        ),
        Property(
            id = 7,
            title = "Prime Development Plot",
            price = "$95,000",
            imageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            beds = 0, baths = 0,
            location = "Evanston, IL",
            category = "Plots"
        ),
        Property(
            id = 8,
            title = "Sunny Family Villa",
            price = "$2,750/mo",
            imageUrl = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
            beds = 4, baths = 3,
            location = "Oak Park, IL",
            category = "Villas",
            isFeatured = true
        )
    )

    val brokers = listOf(
        Broker(
            id = 1,
            name = "Alice Johnson",
            specialty = "Luxury Homes",
            photoUrl = "https://randomuser.me/api/portraits/women/44.jpg",
            rating = 4.8,
            reviewCount = 120,
            title = "Real Estate Agent"
        ),
        Broker(
            id = 2,
            name = "Bob Smith",
            specialty = "Commercial Loans",
            photoUrl = "https://randomuser.me/api/portraits/men/32.jpg",
            rating = 4.6,
            reviewCount = 86,
            title = "Mortgage Broker"
        ),
        Broker(
            id = 3,
            name = "Carla Diaz",
            specialty = "First-Time Buyers",
            photoUrl = "https://randomuser.me/api/portraits/women/68.jpg",
            rating = 4.9,
            reviewCount = 203,
            title = "Real Estate Agent"
        ),
        Broker(
            id = 4,
            name = "David Kim",
            specialty = "Investment Properties",
            photoUrl = "https://randomuser.me/api/portraits/men/76.jpg",
            rating = 4.7,
            reviewCount = 154,
            title = "Property Consultant"
        ),
        Broker(
            id = 5,
            name = "Emma Wilson",
            specialty = "Rentals",
            photoUrl = "https://randomuser.me/api/portraits/women/21.jpg",
            rating = 4.5,
            reviewCount = 97,
            title = "Leasing Agent"
        )
    )

    val jobs = listOf(
        Job(
            id = 1,
            title = "Senior Real Estate Agent",
            company = "Apex Realty",
            location = "Chicago",
            type = "Full-time",
            salary = "$1,000/mo",
            category = "Agents"
        ),
        Job(
            id = 2,
            title = "Property Manager",
            company = "Metro Properties",
            location = "Seattle",
            type = "Full-time",
            salary = "$3,200/mo",
            category = "Project Managers"
        ),
        Job(
            id = 3,
            title = "Junior Leasing Agent",
            company = "Horizon Homes",
            location = "Austin",
            type = "Part-time",
            salary = "$800/mo",
            category = "Agents"
        ),
        Job(
            id = 4,
            title = "Construction Project Manager",
            company = "BuildRight Group",
            location = "Denver",
            type = "Full-time",
            salary = "$4,500/mo",
            category = "Project Managers"
        ),
        Job(
            id = 5,
            title = "Commercial Sales Agent",
            company = "Prime Commercial",
            location = "New York",
            type = "Full-time",
            salary = "$2,200/mo",
            category = "Agents"
        )
    )

    val accountMenuItems = listOf(
        MenuItem("My Listings", "🏠"),
        MenuItem("Favorites", "❤️"),
        MenuItem("Contact Support", "☎️"),
        MenuItem("Privacy Policy", "📄"),
        MenuItem("Logout", "🚪")
    )
}
