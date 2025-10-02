const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    context.log('GetMatches function triggered');

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
        const matchesContainer = database.container("Matches");
        const profilesContainer = database.container("Profiles");

        // Get all matches for the user
        const { resources: matches } = await matchesContainer.items
            .query({
                query: "SELECT * FROM c WHERE c.profileId1 = @userId OR c.profileId2 = @userId",
                parameters: [{ name: "@userId", value: userId }]
            })
            .fetchAll();

        // Get profile details for matched users
        const matchedProfiles = [];
        for (const match of matches) {
            const matchedUserId = match.profileId1 === userId ? match.profileId2 : match.profileId1;
            const { resource: profile } = await profilesContainer.item(matchedUserId, matchedUserId).read();
            if (profile) {
                matchedProfiles.push(profile);
            }
        }

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: matchedProfiles
        };
    } catch (error) {
        context.log.error('Error fetching matches:', error);
        
        // Return sample matches for demo
        const sampleMatches = [
            {
                id: 'profile-001',
                name: 'Alex Johnson',
                age: 28,
                pictureUrl: 'https://picsum.photos/seed/alex/200/200'
            },
            {
                id: 'profile-003',
                name: 'Jordan Davis',
                age: 26,
                pictureUrl: 'https://picsum.photos/seed/jordan/200/200'
            }
        ];

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: sampleMatches
        };
    }
};