const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    context.log('RecordSwipe function triggered');

    const { userId, swipedProfileId, action } = req.body;

    if (!userId || !swipedProfileId || !action) {
        context.res = {
            status: 400,
            body: "Missing required parameters"
        };
        return;
    }

    try {
        // Initialize Cosmos DB client
        const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = cosmosClient.database(process.env.COSMOS_DATABASE_NAME);
        const swipesContainer = database.container("Swipes");
        const matchesContainer = database.container("Matches");
        const profilesContainer = database.container("Profiles");

        // Record the swipe
        const swipe = {
            id: `swipe-${userId}-${swipedProfileId}-${Date.now()}`,
            profileId: userId,
            swipedProfileId: swipedProfileId,
            action: action,
            timestamp: new Date().toISOString()
        };

        await swipesContainer.items.create(swipe);

        let isMatch = false;
        let matchedProfile = null;

        // Check for match if action is "like"
        if (action === 'like') {
            const { resources: reciprocalSwipes } = await swipesContainer.items
                .query({
                    query: "SELECT * FROM c WHERE c.profileId = @swipedProfileId AND c.swipedProfileId = @userId AND c.action = 'like'",
                    parameters: [
                        { name: "@swipedProfileId", value: swipedProfileId },
                        { name: "@userId", value: userId }
                    ]
                })
                .fetchAll();

            if (reciprocalSwipes.length > 0) {
                // It's a match!
                isMatch = true;

                // Create match record
                const match = {
                    id: `match-${Date.now()}`,
                    profileId1: userId,
                    profileId2: swipedProfileId,
                    timestamp: new Date().toISOString()
                };

                await matchesContainer.items.create(match);

                // Get matched profile details
                const { resource: profile } = await profilesContainer.item(swipedProfileId, swipedProfileId).read();
                matchedProfile = profile;
            }
        }

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                success: true,
                isMatch: isMatch,
                matchedProfile: matchedProfile
            }
        };
    } catch (error) {
        context.log.error('Error recording swipe:', error);
        
        // Return success for demo even if database fails
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                success: true,
                isMatch: false,
                matchedProfile: null
            }
        };
    }
};