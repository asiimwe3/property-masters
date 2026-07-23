package com.propertymasters.app.data.repository

import com.propertymasters.app.data.model.Broker
import com.propertymasters.app.data.model.Job
import com.propertymasters.app.data.model.Property
import com.propertymasters.app.data.model.UserProfile

object MockDataRepository {

    val properties: List<Property> = listOf(
        Property(
            id = "p1",
            title = "Cozy Suburban House",
            location = "Kampala, Naguru",
            price = "$185,000",
            imageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
                "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
                "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800"
            ),
            beds = 3,
            baths = 2,
            areaSqft = 1450,
            category = "House",
            isFeatured = true,
            description = "A beautiful suburban family home in the heart of Naguru. This property features spacious living areas, a modern kitchen with granite countertops, and a lush garden perfect for family gatherings. Located in a quiet, secure neighborhood with easy access to schools, shopping centers, and the city center.",
            amenities = listOf("Swimming Pool", "Garden", "Security", "Parking (2 cars)", "Air Conditioning", "Backup Generator"),
            brokerId = "b1",
            yearBuilt = 2019,
            parking = 2,
            status = "For Sale"
        ),
        Property(
            id = "p2",
            title = "Modern Downtown Condo",
            location = "Kampala, Kololo",
            price = "$220,500",
            imageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ),
            beds = 2,
            baths = 2,
            areaSqft = 980,
            category = "Condo",
            isFeatured = true,
            description = "Sleek, modern condominium in upscale Kololo. Floor-to-ceiling windows with panoramic city views. Open-plan living, premium appliances, and a rooftop terrace. Walking distance to international restaurants and embassies.",
            amenities = listOf("Rooftop Terrace", "Gym", "Elevator", "24/7 Security", "Backup Power", "High-Speed Internet"),
            brokerId = "b3",
            yearBuilt = 2021,
            parking = 1,
            status = "For Sale"
        ),
        Property(
            id = "p3",
            title = "Luxury Lakeside Villa",
            location = "Entebbe, Lake Victoria",
            price = "$540,000",
            imageUrl = "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1564013799929-47e2b1dfe995?w=800",
                "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"
            ),
            beds = 5,
            baths = 4,
            areaSqft = 3200,
            category = "Villa",
            isFeatured = true,
            description = "An exquisite lakeside villa offering uninterrupted views of Lake Victoria. Features a private infinity pool, manicured tropical gardens, a home theater, and a detached guest wing. The perfect retreat for those who appreciate luxury living.",
            amenities = listOf("Infinity Pool", "Lake View", "Home Theater", "Guest Wing", "Solar Power", "Boat Dock", "Staff Quarters"),
            brokerId = "b1",
            yearBuilt = 2020,
            parking = 4,
            status = "For Sale"
        ),
        Property(
            id = "p4",
            title = "Cozy Studio Apartment",
            location = "Kampala, Bugolobi",
            price = "$78,000",
            imageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ),
            beds = 1,
            baths = 1,
            areaSqft = 520,
            category = "Apartment",
            description = "Compact and elegant studio apartment in the trendy Bugolobi neighborhood. Ideal for young professionals. Features a modern kitchenette, built-in storage, and access to a communal gym and pool.",
            amenities = listOf("Gym Access", "Pool Access", "Security", "Parking (1 car)", "Backup Power"),
            brokerId = "b4",
            yearBuilt = 2022,
            parking = 1,
            status = "For Sale"
        ),
        Property(
            id = "p5",
            title = "Family Home with Garden",
            location = "Mukono, Central",
            price = "$165,000",
            imageUrl = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
            ),
            beds = 4,
            baths = 3,
            areaSqft = 2100,
            category = "House",
            description = "Spacious family home in Mukono with a large garden, perfect for children. Features a covered carport, an outdoor entertainment area, and a modern fitted kitchen. Close to top schools and the highway.",
            amenities = listOf("Large Garden", "Carport", "Outdoor Kitchen", "Servants Quarters", "Water Tank", "Security Wall"),
            brokerId = "b2",
            yearBuilt = 2018,
            parking = 2,
            status = "For Sale"
        ),
        Property(
            id = "p6",
            title = "Sleek City Loft",
            location = "Kampala, Nakasero",
            price = "$249,000",
            imageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
            ),
            beds = 2,
            baths = 1,
            areaSqft = 890,
            category = "Condo",
            description = "Industrial-chic loft in the heart of Nakasero. Exposed brick walls, polished concrete floors, and designer lighting. Walking distance to government offices and the central business district.",
            amenities = listOf("Smart Home System", "Elevator", "Gym", "Concierge", "Backup Generator", "Secure Parking"),
            brokerId = "b3",
            yearBuilt = 2023,
            parking = 1,
            status = "For Sale"
        ),
        Property(
            id = "p7",
            title = "Countryside Bungalow",
            location = "Jinja, Riverside",
            price = "$132,000",
            imageUrl = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
            ),
            beds = 3,
            baths = 2,
            areaSqft = 1600,
            category = "House",
            description = "Charming countryside bungalow near the Source of the Nile. Relaxing riverside location with mature trees and a covered veranda. Perfect for retirement or a weekend getaway.",
            amenities = listOf("Riverside View", "Veranda", "Mature Garden", "Borehole Water", "Solar Heating"),
            brokerId = "b5",
            yearBuilt = 2016,
            parking = 2,
            status = "For Sale"
        ),
        Property(
            id = "p8",
            title = "Beachfront Retreat Villa",
            location = "Entebbe, Shoreline",
            price = "$610,000",
            imageUrl = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
                "https://images.unsplash.com/photo-1564013799929-47e2b1dfe995?w=800"
            ),
            beds = 6,
            baths = 5,
            areaSqft = 4100,
            category = "Villa",
            isFeatured = true,
            description = "A spectacular beachfront villa on the Entebbe shoreline. Private beach access, a stunning pool deck, and panoramic lake views. Designed for luxury entertaining with an open-plan living area, wine cellar, and outdoor bar.",
            amenities = listOf("Private Beach", "Pool", "Wine Cellar", "Outdoor Bar", "6-Car Garage", "Staff Wing", "Solar System"),
            brokerId = "b1",
            yearBuilt = 2021,
            parking = 6,
            status = "For Sale"
        ),
        Property(
            id = "p9",
            title = "Modern Townhouse",
            location = "Kampala, Kira",
            price = "$145,000",
            imageUrl = "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
            ),
            beds = 3,
            baths = 2,
            areaSqft = 1650,
            category = "House",
            description = "Contemporary townhouse in a gated community in Kira. Shared amenities include a playground and jogging track. Modern finishes throughout with an open kitchen and a paved backyard.",
            amenities = listOf("Gated Community", "Playground", "Jogging Track", "Security", "Backup Power", "Parking (2 cars)"],
            brokerId = "b4",
            yearBuilt = 2020,
            parking = 2,
            status = "For Sale"
        ),
        Property(
            id = "p10",
            title = "Executive Penthouse",
            location = "Kampala, Naguru Hill",
            price = "$420,000",
            imageUrl = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ),
            beds = 4,
            baths = 3,
            areaSqft = 2400,
            category = "Penthouse",
            isFeatured = true,
            description = "Ultra-luxury penthouse atop Naguru Hill with 360-degree views of Kampala. Private elevator, wraparound terrace, and a Jacuzzi. The pinnacle of urban luxury living.",
            amenities = listOf("Private Elevator", "Wraparound Terrace", "Jacuzzi", "Smart Home", "Concierge", "Gym", "3 Parking Spaces", "Storage Room"],
            brokerId = "b3",
            yearBuilt = 2023,
            parking = 3,
            status = "For Sale"
        ),
        Property(
            id = "p11",
            title = "Garden Apartment",
            location = "Kampala, Bukoto",
            price = "$95,000",
            imageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
            ),
            beds = 2,
            baths = 2,
            areaSqft = 1100,
            category = "Apartment",
            description = "Bright and airy garden apartment in Bukoto. Ground floor access to a shared garden. Recently renovated with new appliances and contemporary bathrooms.",
            amenities = listOf("Garden Access", "Renovated", "Security", "Parking (1 car)", "Backup Power"],
            brokerId = "b5",
            yearBuilt = 2017,
            parking = 1,
            status = "For Sale"
        ),
        Property(
            id = "p12",
            title = "Commercial Retail Space",
            location = "Kampala, Kampala Road",
            price = "$320,000",
            imageUrl = "https://images.unsplash.com/photo-1497366754035-f200968a6e44?w=800",
            galleryImages = listOf(
                "https://images.unsplash.com/photo-1497366754035-f200968a6e44?w=800",
                "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
            ),
            beds = 0,
            baths = 2,
            areaSqft = 2800,
            category = "Commercial",
            description = "Prime retail space on Kampala Road with high foot traffic. Large display windows, mezzanine office level, and dedicated parking. Ideal for a flagship store or showroom.",
            amenities = listOf("High Foot Traffic", "Display Windows", "Mezzanine Office", "Parking (4 cars)", "Loading Bay", "24/7 Security"],
            brokerId = "b2",
            yearBuilt = 2015,
            parking = 4,
            status = "For Sale"
        )
    )

    val brokers: List<Broker> = listOf(
        Broker(
            id = "b1",
            name = "Alice Johnson",
            specialty = "Luxury Homes",
            rating = 4.8,
            reviewCount = 120,
            photoUrl = "https://randomuser.me/api/portraits/women/44.jpg",
            listingsCount = 32,
            bio = "Alice has over 12 years of experience in the luxury real estate market. She specializes in high-end villas and penthouses across Kampala and Entebbe. Her clients include diplomats, executives, and investors.",
            phone = "+256 772 100 200",
            email = "alice@propertymasters.com",
            experienceYears = 12,
            languages = listOf("English", "Luganda", "Swahili"),
            areasServed = listOf("Kampala", "Entebbe", "Jinja")
        ),
        Broker(
            id = "b2",
            name = "David Mensah",
            specialty = "Commercial Properties",
            rating = 4.6,
            reviewCount = 98,
            photoUrl = "https://randomuser.me/api/portraits/men/32.jpg",
            listingsCount = 27,
            bio = "David is a commercial real estate expert with a background in finance. He helps businesses find the perfect retail, office, and industrial spaces. Known for his data-driven approach and strong negotiation skills.",
            phone = "+256 772 100 201",
            email = "david@propertymasters.com",
            experienceYears = 9,
            languages = listOf("English", "Luganda"),
            areasServed = listOf("Kampala", "Mukono")
        ),
        Broker(
            id = "b3",
            name = "Grace Nakato",
            specialty = "Residential & Rentals",
            rating = 4.9,
            reviewCount = 156,
            photoUrl = "https://randomuser.me/api/portraits/women/68.jpg",
            listingsCount = 41,
            bio = "Grace is the top-rated broker at Property Masters. She specializes in residential properties and rental management. Her personalized approach has earned her a loyal client base of families and young professionals.",
            phone = "+256 772 100 202",
            email = "grace@propertymasters.com",
            experienceYears = 10,
            languages = listOf("English", "Luganda", "Runyoro", "Swahili"),
            areasServed = listOf("Kampala", "Mukono", "Wakiso")
        ),
        Broker(
            id = "b4",
            name = "Samuel Okello",
            specialty = "New Developments",
            rating = 4.7,
            reviewCount = 84,
            photoUrl = "https://randomuser.me/api/portraits/men/76.jpg",
            listingsCount = 19,
            bio = "Samuel focuses on new developments and off-plan investments. He works closely with developers to bring exclusive pre-launch deals to his clients. A trusted advisor for first-time homebuyers.",
            phone = "+256 772 100 203",
            email = "samuel@propertymasters.com",
            experienceYears = 7,
            languages = listOf("English", "Luganda", "Swahili"),
            areasServed = listOf("Kampala", "Kira", "Mukono")
        ),
        Broker(
            id = "b5",
            name = "Patricia Achieng",
            specialty = "Luxury Homes",
            rating = 4.5,
            reviewCount = 63,
            photoUrl = "https://randomuser.me/api/portraits/women/21.jpg",
            listingsCount = 22,
            bio = "Patricia brings a background in interior design to her real estate practice. She has a keen eye for properties with potential and helps clients envision the possibilities. Specializes in countryside and lakeside properties.",
            phone = "+256 772 100 204",
            email = "patricia@propertymasters.com",
            experienceYears = 6,
            languages = listOf("English", "Luganda", "Luo"),
            areasServed = listOf("Kampala", "Entebbe", "Jinja")
        )
    )

    val jobs: List<Job> = listOf(
        Job(
            id = "j1",
            title = "Senior Real Estate Agent",
            company = "Property Masters Realty",
            location = "Kampala, Uganda",
            jobType = "Full-time",
            salary = "$1,200 - $2,000/mo",
            category = "Agents",
            postedDaysAgo = 2,
            description = "We are seeking an experienced real estate agent to join our growing team. You will be responsible for managing client relationships, conducting property viewings, and closing deals. This is a commission-enhanced role with a strong base salary.",
            requirements = listOf("Minimum 3 years real estate experience", "Valid real estate license", "Strong communication skills", "Own smartphone and transport", "Knowledge of Kampala property market"),
            responsibilities = listOf("Manage client property listings", "Conduct property viewings and open houses", "Negotiate and close deals", "Maintain client relationships", "Prepare and submit contracts"),
            contactEmail = "careers@propertymasters.com",
            contactPhone = "+256 776 004 277",
            logoUrl = ""
        ),
        Job(
            id = "j2",
            title = "Junior Property Consultant",
            company = "Urban Homes Ltd",
            location = "Entebbe, Uganda",
            jobType = "Full-time",
            salary = "$600 - $900/mo",
            category = "Agents",
            postedDaysAgo = 5,
            description = "Great entry-level opportunity for someone passionate about real estate. You will learn the ropes from senior agents while assisting with client inquiries and property showings.",
            requirements = listOf("Diploma in Business or related field", "Good communication skills", "Willingness to learn", "Computer literacy", "Resident of Entebbe or willing to relocate"),
            responsibilities = listOf("Assist senior agents with viewings", "Handle client inquiries", "Update property listings", "Prepare marketing materials", "Conduct market research"),
            contactEmail = "hr@urbanhomes.co.ug",
            contactPhone = "+256 700 123 456",
            logoUrl = ""
        ),
        Job(
            id = "j3",
            title = "Construction Project Manager",
            company = "SkyLine Developers",
            location = "Kampala, Uganda",
            jobType = "Full-time",
            salary = "$1,800 - $2,500/mo",
            category = "Project Managers",
            postedDaysAgo = 1,
            description = "Lead construction projects from groundbreaking to handover. You will oversee multiple residential and commercial developments, ensuring quality, timeline, and budget compliance.",
            requirements = listOf("Degree in Civil Engineering or Construction Management", "Minimum 5 years project management experience", "PMP or equivalent certification preferred", "Knowledge of Ugandan building codes", "Strong leadership skills"),
            responsibilities = listOf("Oversee construction sites", "Manage project budgets and timelines", "Coordinate with contractors and suppliers", "Ensure quality and safety standards", "Report to senior management"),
            contactEmail = "projects@skyline.co.ug",
            contactPhone = "+256 701 234 567",
            logoUrl = ""
        ),
        Job(
            id = "j4",
            title = "Site Project Manager",
            company = "Horizon Estates",
            location = "Jinja, Uganda",
            jobType = "Contract",
            salary = "$1,400 - $1,900/mo",
            category = "Project Managers",
            postedDaysAgo = 8,
            description = "Manage day-to-day operations at a residential construction site in Jinja. 12-month contract with possibility of extension. Accommodation provided on site.",
            requirements = listOf("Diploma in Construction or related", "3+ years site management", "First Aid certification", "Resident of Jinja or willing to relocate", "Valid driving permit"),
            responsibilities = listOf("Daily site supervision", "Manage construction crew", "Maintain safety standards", "Track material inventory", "Liaise with project architect"],
            contactEmail = "hr@horizon.co.ug",
            contactPhone = "+256 702 345 678",
            logoUrl = ""
        ),
        Job(
            id = "j5",
            title = "Leasing Agent",
            company = "Property Masters Realty",
            location = "Mukono, Uganda",
            jobType = "Part-time",
            salary = "$400 - $700/mo",
            category = "Agents",
            postedDaysAgo = 3,
            description = "Part-time leasing agent role managing rental properties in Mukono. Flexible hours, ideal for someone with another primary income source. Commission on each signed lease.",
            requirements = listOf("Good communication skills", "Knowledge of Mukono area", "Smartphone and WhatsApp", "Customer service experience"),
            responsibilities = listOf("Show rental properties to tenants", "Process lease applications", "Conduct move-in/move-out inspections", "Collect rent", "Handle tenant inquiries"],
            contactEmail = "leasing@propertymasters.com",
            contactPhone = "+256 776 004 277",
            logoUrl = ""
        ),
        Job(
            id = "j6",
            title = "Property Marketing Manager",
            company = "Nile Realty Group",
            location = "Kampala, Uganda",
            jobType = "Full-time",
            salary = "$1,000 - $1,500/mo",
            category = "Project Managers",
            postedDaysAgo = 6,
            description = "Drive marketing strategy for a portfolio of luxury properties. Manage digital campaigns, social media presence, and property photography. Creative role with growth potential.",
            requirements = listOf("Degree in Marketing or related", "2+ years digital marketing experience", "Photography skills a plus", "Experience with social media ads", "Real estate knowledge preferred"],
            responsibilities = listOf("Develop marketing strategies", "Manage social media accounts", "Coordinate property photography", "Run digital ad campaigns", "Track and report on marketing ROI"],
            contactEmail = "marketing@nilerealty.co.ug",
            contactPhone = "+256 703 456 789",
            logoUrl = ""
        )
    )

    val propertyCategories = listOf("All", "House", "Condo", "Villa", "Apartment", "Penthouse", "Commercial")
    val jobCategories = listOf("All", "Agents", "Project Managers")

    val currentUser = UserProfile(
        name = "Sarah Miller",
        email = "sarah.miller@propertymasters.com",
        photoUrl = "https://randomuser.me/api/portraits/women/65.jpg",
        isVerified = true,
        phone = "+256 772 555 999",
        joinedDate = "March 2024",
        savedProperties = listOf("p1", "p3", "p10"),
        listedProperties = listOf("p9", "p11")
    )

    fun getBrokerById(id: String): Broker? = brokers.find { it.id == id }

    fun getPropertiesByBroker(brokerId: String): List<Property> = properties.filter { it.brokerId == brokerId }

    fun getPropertyById(id: String): Property? = properties.find { it.id == id }

    fun getJobById(id: String): Job? = jobs.find { it.id == id }
}
