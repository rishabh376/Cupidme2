// Azure Cupid - Main JavaScript File

// Configuration - Update these with your Azure Function endpoints
const API_BASE_URL = 'https://YOUR-FUNCTION-APP.azurewebsites.net/api';

// Current user ID (simulated - in production, this would come from authentication)
const CURRENT_USER_ID = 'user-demo-001';

// Global variables
let currentProfiles = [];
let currentCardIndex = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;
let cardElement = null;

// Load profiles for discovery
async function loadProfiles() {
    try {
        const response = await fetch(`${API_BASE_URL}/GetProfiles?userId=${CURRENT_USER_ID}`);
        if (!response.ok) throw new Error('Failed to load profiles');
        
        const profiles = await response.json();
        currentProfiles = profiles;
        currentCardIndex = 0;
        
        displayProfileCard();
    } catch (error) {
        console.error('Error loading profiles:', error);
        // For demo purposes, use sample data if API fails
        useSampleProfiles();
    }
}

// Use sample profiles for demo
function useSampleProfiles() {
    currentProfiles = [
        {
            id: 'profile-001',
            name: 'Alex Johnson',
            age: 28,
            bio: 'Software developer who loves hiking and coffee. Looking for someone to explore the city with!',
            pictureUrl: 'https://picsum.photos/seed/alex/400/600'
        },
        {
            id: 'profile-002',
            name: 'Sam Williams',
            age: 32,
            bio: 'Passionate about cooking and travel. Let\'s share recipes and adventure stories!',
            pictureUrl: 'https://picsum.photos/seed/sam/400/600'
        },
        {
            id: 'profile-003',
            name: 'Jordan Davis',
            age: 26,
            bio: 'Yoga instructor and nature enthusiast. Seeking genuine connections and good vibes.',
            pictureUrl: 'https://picsum.photos/seed/jordan/400/600'
        },
        {
            id: 'profile-004',
            name: 'Taylor Brown',
            age: 29,
            bio: 'Music lover, bookworm, and amateur photographer. Let\'s create some memories!',
            pictureUrl: 'https://picsum.photos/seed/taylor/400/600'
        },
        {
            id: 'profile-005',
            name: 'Morgan Lee',
            age: 31,
            bio: 'Entrepreneur with a passion for sustainability. Looking for someone who shares my values.',
            pictureUrl: 'https://picsum.photos/seed/morgan/400/600'
        }
    ];
    displayProfileCard();
}

// Display current profile card
function displayProfileCard() {
    const cardStack = document.getElementById('cardStack');
    if (!cardStack) return;
    
    if (currentCardIndex >= currentProfiles.length) {
        cardStack.style.display = 'none';
        document.getElementById('noMoreProfiles').style.display = 'block';
        return;
    }
    
    const profile = currentProfiles[currentCardIndex];
    const cardHTML = `
        <div class="profile-card" id="currentCard" 
             onmousedown="startDrag(event)" 
             ontouchstart="startDrag(event)">
            <img src="${profile.pictureUrl}" alt="${profile.name}" class="profile-image">
            <div class="profile-info">
                <h3 class="profile-name">${profile.name}</h3>
                <p class="profile-age">Age: ${profile.age}</p>
                <p class="profile-bio">${profile.bio}</p>
            </div>
        </div>
    `;
    
    cardStack.innerHTML = cardHTML;
}

// Start dragging the card
function startDrag(e) {
    isDragging = true;
    cardElement = document.getElementById('currentCard');
    if (!cardElement) return;
    
    cardElement.classList.add('dragging');
    
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', endDrag);
}

// Handle dragging
function onDrag(e) {
    if (!isDragging || !cardElement) return;
    
    e.preventDefault();
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - startX;
    const rotation = deltaX * 0.1;
    
    cardElement.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    
    // Visual feedback for swipe direction
    if (deltaX > 50) {
        cardElement.style.borderColor = '#51cf66';
    } else if (deltaX < -50) {
        cardElement.style.borderColor = '#ff6b6b';
    } else {
        cardElement.style.borderColor = 'transparent';
    }
}

// End dragging
function endDrag(e) {
    if (!isDragging || !cardElement) return;
    
    isDragging = false;
    cardElement.classList.remove('dragging');
    
    const deltaX = currentX - startX;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
        const action = deltaX > 0 ? 'like' : 'pass';
        swipeCard(action);
    } else {
        // Snap back to center
        cardElement.style.transform = 'translateX(0) rotate(0)';
        cardElement.style.borderColor = 'transparent';
    }
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
}

// Swipe card programmatically
async function swipeCard(action) {
    const card = document.getElementById('currentCard');
    if (!card) return;
    
    const profile = currentProfiles[currentCardIndex];
    
    // Animate card off screen
    if (action === 'like') {
        card.classList.add('swiped-right');
    } else {
        card.classList.add('swiped-left');
    }
    
    // Record swipe
    try {
        await recordSwipe(profile.id, action);
    } catch (error) {
        console.error('Error recording swipe:', error);
    }
    
    // Move to next profile after animation
    setTimeout(() => {
        currentCardIndex++;
        displayProfileCard();
    }, 300);
}

// Record swipe action
async function recordSwipe(swipedProfileId, action) {
    try {
        const response = await fetch(`${API_BASE_URL}/RecordSwipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: CURRENT_USER_ID,
                swipedProfileId: swipedProfileId,
                action: action
            })
        });
        
        const result = await response.json();
        
        if (result.isMatch) {
            showMatchNotification(result.matchedProfile);
        }
    } catch (error) {
        console.error('Error recording swipe:', error);
    }
}

// Show match notification
function showMatchNotification(profile) {
    const notification = document.createElement('div');
    notification.className = 'match-notification';
    notification.innerHTML = `
        <h3>It's a Match! 🎉</h3>
        <p>You and ${profile.name} liked each other!</p>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        text-align: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load matches
async function loadMatches() {
    try {
        const response = await fetch(`${API_BASE_URL}/GetMatches?userId=${CURRENT_USER_ID}`);
        if (!response.ok) throw new Error('Failed to load matches');
        
        const matches = await response.json();
        displayMatches(matches);
    } catch (error) {
        console.error('Error loading matches:', error);
        // For demo purposes, show sample matches
        displaySampleMatches();
    }
}

// Display matches
function displayMatches(matches) {
    const matchesList = document.getElementById('matchesList');
    const noMatches = document.getElementById('noMatches');
    
    if (!matchesList) return;
    
    if (matches.length === 0) {
        matchesList.style.display = 'none';
        noMatches.style.display = 'block';
        return;
    }
    
    const matchesHTML = matches.map(match => `
        <div class="match-card">
            <img src="${match.pictureUrl}" alt="${match.name}" class="match-image">
            <div class="match-info">
                <div class="match-name">${match.name}</div>
                <div class="match-age">Age: ${match.age}</div>
            </div>
        </div>
    `).join('');
    
    matchesList.innerHTML = matchesHTML;
}

// Display sample matches for demo
function displaySampleMatches() {
    const sampleMatches = [
        {
            name: 'Alex Johnson',
            age: 28,
            pictureUrl: 'https://picsum.photos/seed/alex/200/200'
        },
        {
            name: 'Jordan Davis',
            age: 26,
            pictureUrl: 'https://picsum.photos/seed/jordan/200/200'
        }
    ];
    
    displayMatches(sampleMatches);
}

// Load user profile
function loadProfile() {
    // Load saved profile from localStorage (for demo)
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('name').value = profile.name || '';
        document.getElementById('age').value = profile.age || '';
        document.getElementById('bio').value = profile.bio || '';
        
        if (profile.pictureUrl) {
            displayPhotoPreview(profile.pictureUrl);
        }
    }
}

// Save profile
async function saveProfile(e) {
    e.preventDefault();
    
    const profile = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        bio: document.getElementById('bio').value
    };
    
    // Handle photo upload if selected
    const photoInput = document.getElementById('photo');
    if (photoInput.files.length > 0) {
        try {
            const pictureUrl = await uploadPhoto(photoInput.files[0]);
            profile.pictureUrl = pictureUrl;
        } catch (error) {
            console.error('Error uploading photo:', error);
        }
    }
    
    // Save to localStorage (for demo)
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Show success message
    alert('Profile saved successfully!');
}

// Preview photo
function previewPhoto(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            displayPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Display photo preview
function displayPhotoPreview(url) {
    const preview = document.getElementById('photoPreview');
    if (preview) {
        preview.innerHTML = `<img src="${url}" alt="Profile preview">`;
    }
}

// Upload photo to Azure Blob Storage
async function uploadPhoto(file) {
    try {
        // Get SAS URL from Azure Function
        const response = await fetch(`${API_BASE_URL}/UploadImage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type
            })
        });
        
        const { sasUrl } = await response.json();
        
        // Upload file to Blob Storage
        const uploadResponse = await fetch(sasUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': file.type
            },
            body: file
        });
        
        if (!uploadResponse.ok) throw new Error('Failed to upload image');
        
        // Return the URL without the SAS token
        return sasUrl.split('?')[0];
    } catch (error) {
        console.error('Error uploading photo:', error);
        // Return a placeholder for demo
        return 'https://picsum.photos/seed/user/400/600';
    }
}