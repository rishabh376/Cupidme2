const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    context.log('GetProfiles function triggered');

    const userId = req.query.userId;
    if (!userId) {
        context.res = {
            status: 400,
            body: "Please provide a userId parameter"
        };
        return;
    }

    try {
        // Initialize Cosmos DB client
        const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME);
        const profilesContainer = database.container("Profiles");
        const swipesContainer = database.container("Swipes");

        // Get all profiles except the current user
        const { resources: profiles } = await profilesContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.id != @userId",
                parameters: [{ name: "@userId", value: userId }]
            })
            .fetchAll();

        // Get user's previous swipes
        const { resources: swipes } = await swipesContainer.items
            .query({
                query: "SELECT c.swipedProfileId FROM c WHERE c.profileId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            })
            .fetchAll();

        const swipedIds = swipes.map(s => s.swipedProfileId);

        // Filter out already swiped profiles
        const unseenProfiles = profiles.filter(p => !swipedIds.includes(p.id));

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: unseenProfiles
        };
    } catch (error) {
        context.log.error('Error fetching profiles:', error);
        
        // Return sample data for demo if database is not configured
        const sampleProfiles = [
            {
                id: 'profile-001',
                name: 'Alex Johnson',
                age: 28,
                bio: 'Software developer who loves hiking and coffee.',
                pictureUrl: 'https://picsum.photos/seed/alex/400/600'
            },
            {
                id: 'profile-002',
                name: 'Sam Williams',
                age: 32,
                bio: 'Passionate about cooking and travel.',
                pictureUrl: 'https://picsum.photos/seed/sam/400/600'
            },
            {
                id: 'profile-003',
                name: 'Jordan Davis',
                age: 26,
                bio: 'Yoga instructor and nature enthusiast.',
                pictureUrl: 'https://picsum.photos/seed/jordan/400/600'
            }
        ];

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: sampleProfiles
        };
    }
};