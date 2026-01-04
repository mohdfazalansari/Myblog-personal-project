document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        token: null,
        user: null,
        posts: [],
        categories: [],
        currentPost: null,
        apiBaseUrl: 'http://localhost:8080/api' // Make sure this is your correct backend URL
    };

    // --- SELECTORS (Updated for new HTML) ---
    const allPostsView = document.getElementById('all-posts-view');
    const singlePostView = document.getElementById('single-post-view');
    const postsContainer = document.getElementById('posts-container');
    const categoriesContainer = document.getElementById('categories-container');
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    const homeLink = document.getElementById('home-link'); // Changed to ID
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const logoutBtn = document.getElementById('logout-btn');
    const createPostNavBtn = document.getElementById('create-post-nav-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const postModal = document.getElementById('post-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const postForm = document.getElementById('post-form');
    const postImageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    // ================== DARK MODE SCRIPT ==================
   const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn'); // <-- Use querySelectorAll
const bodyElement = document.body;

// Function to set the theme
function setTheme(theme) {
    if (theme === 'dark') {
        bodyElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark'); // Save preference
    } else {
        bodyElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light'); // Save preference
    }
}

// Add click listener to ALL buttons that have the class
if (themeToggleBtns.length > 0) {
    themeToggleBtns.forEach(btn => { // <-- Loop through each button
        btn.addEventListener('click', () => {
            if (bodyElement.classList.contains('dark-mode')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    });
}

// Check for saved theme on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    // Optional: Set default based on user's computer preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

    // --- API SERVICE (Same as your old code) ---
    async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        if (requiresAuth && state.token) {
            headers.append('Authorization', `Bearer ${state.token}`);
        }
        const config = { method, headers, body: body ? JSON.stringify(body) : null };
        try {
            const response = await fetch(`${state.apiBaseUrl}${endpoint}`, config);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // --- RENDER FUNCTIONS (CRITICAL UPDATE) ---

    /**
     * Renders all posts.
     * This function's HTML is now completely rewritten to match the new style.css
     */
    function renderAllPosts() {
        allPostsView.classList.remove('hidden');
        singlePostView.classList.add('hidden');
        if (!postsContainer) return; // Guard clause
        
        postsContainer.innerHTML = '';
        if (state.posts.length === 0) {
            postsContainer.innerHTML = '<p>No posts found.</p>';
            return;
        }

        state.posts.forEach(post => {
            const postCard = document.createElement('article');
            postCard.className = 'news-card';
            
            const isAuthor = state.user && post.author && state.user.id === post.author.id;
            const authorControlsHTML = isAuthor ? `
                <div class="author-controls" style="margin-top: 10px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                    <button class="edit-post-btn btn-link" data-post-id="${post.id}">Edit</button>
                    <button class="delete-post-btn btn-link-danger" data-post-id="${post.id}">Delete</button>
                </div>` : '';
            
            // Handle image URL
            const imageUrl = post.imageUrl 
                ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${state.apiBaseUrl.replace('/api', '')}${post.imageUrl}`)
                : 'https://via.placeholder.com/400x250.png?text=No+Image';

            const postDate = new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            const authorName = post.author ? post.author.name : 'Unknown Author';

            // --- NEW CARD HTML (to match new CSS) ---
            postCard.innerHTML = `
                <img src="${imageUrl}" alt="${post.title}">
                <div class="card-content">
                    <div class="card-meta">
                        <span>${postDate}</span>
                        <span>${post.comments ? post.comments.length : 0} Comments</span>
                    </div>
                    <h3>
                        <a href="#" class="post-link" data-post-id="${post.id}">${post.title}</a>
                    </h3>
                    <p>${post.content.substring(0, 100)}...</p>
                    <div class="card-footer">
                        <span class="author">${authorName}</span>
                        <a href="#" class="read-more post-link" data-post-id="${post.id}">Read More &rarr;</a>
                    </div>
                    ${authorControlsHTML}
                </div>`;
            // --- END OF NEW CARD HTML ---

            postsContainer.appendChild(postCard);
        });
    }

    /**
     * Renders a single post.
     * This function's HTML is also new, to create the single post view.
     */
   function renderSinglePost() {
    allPostsView.classList.add('hidden');
    singlePostView.classList.remove('hidden');
    
    const post = state.currentPost;
    if (!post) return;

    const isAuthor = state.user && post.author && state.user.id === post.author.id;
    const authorControlsHTML = isAuthor ? `
        <div class="author-controls-single" style="margin-bottom: 20px;">
            <button class="edit-post-btn btn-link" data-post-id="${post.id}">Edit Post</button>
            <button class="delete-post-btn btn-link-danger" data-post-id="${post.id}">Delete Post</button>
        </div>` : '';

    const imageUrl = post.imageUrl 
        ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${state.apiBaseUrl.replace('/api', '')}${post.imageUrl}`)
        : '';
    
    const postDate = new Date(post.createdAt).toLocaleString();
    const authorName = post.author ? post.author.name : 'Unknown Author';
    const categoryName = post.category ? post.category.name : 'Uncategorized';

    // --- HTML STRUCTURE IS CHANGED HERE ---
    singlePostView.innerHTML = `
        <div class="post-content-wrapper">
            
            ${imageUrl ? `<img src="${imageUrl}" alt="${post.title}" class="post-full-image">` : ''}
            
            <div class="post-text-content">
                ${authorControlsHTML}
                <h2>${post.title}</h2>
                <div class="post-meta-single">
                    By <strong>${authorName}</strong> in <strong>${categoryName}</strong>
                    <br>
                    On ${postDate}
                </div>
                <div class="post-content-full">
                    ${post.content.replace(/\n/g, '<br>')}
                </div>
            </div>

        </div> <div id="comments-section">
             <h3>Comments (${post.comments ? post.comments.length : 0})</h3>
             <div id="comments-list">
                 ${post.comments && post.comments.length > 0 ? 
                     post.comments.map(comment => `
                         <div class="comment">
                             <p>${comment.content}</p>
                             <div class="comment-meta">
                                 By <strong>${comment.author.name}</strong> on ${new Date(comment.createdAt).toLocaleString()}
                             </div>
                         </div>
                     `).join('') 
                     : '<p>No comments yet.</p>'}
             </div>
             
             ${state.token ? `
                 <form id="comment-form">
                     <h4>Leave a Comment</h4>
                     <textarea id="comment-content" rows="4" required placeholder="Write your comment..."></textarea>
                     <button type="submit">Submit Comment</button>
                 </form>` 
                 : '<p style="margin-top: 20px;">You must be <span id="login-from-comment" class="btn-link">logged in</span> to comment.</p>'}
        </div>
    `;
}

    /**
     * Renders category filter buttons.
     */
    function renderCategories() {
        if (!categoriesContainer) return; // Guard clause
        
        categoriesContainer.innerHTML = ''; // Clear existing
        
        // Add 'All' button
        const allButton = document.createElement('button');
        allButton.className = 'category-btn active'; // Active by default
        allButton.textContent = 'All Posts';
        allButton.dataset.categoryId = 'all';
        categoriesContainer.appendChild(allButton);

        // Add buttons for each category
        state.categories.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.className = 'category-btn inactive';
            categoryButton.textContent = category.name;
            categoryButton.dataset.categoryId = category.id;
            categoriesContainer.appendChild(categoryButton);
        });
    }

    /**
     * Updates header UI based on login state.
     */
    function updateUIForAuthState() {
        if (state.token) {
            authLinks.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userEmailSpan.textContent = state.user.name || state.user.email; // Show name if available
        } else {
            authLinks.classList.remove('hidden');
            userInfo.classList.add('hidden');
            userEmailSpan.textContent = '';
        }
        // Re-render views to show/hide author controls
        if (!singlePostView.classList.contains('hidden')) renderSinglePost();
        if (!allPostsView.classList.contains('hidden')) renderAllPosts();
    }

    /**
     * Populates the category dropdown in the Create/Edit Post modal.
     */
    async function populateCategoriesDropdown() {
        try {
            if (state.categories.length === 0) {
                 state.categories = await apiRequest('/categories');
            }
            const categorySelect = document.getElementById('post-category');
            if (!categorySelect) return;
            
            categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
            state.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load categories for dropdown", error);
        }
    }

    // --- MODAL FUNCTIONS (Updated) ---
    function showModal(modal) { modal.classList.remove('hidden'); }
    function hideModal(modal) { modal.classList.add('hidden'); }
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => hideModal(e.target.closest('.modal-backdrop')));
    });

    // --- EVENT LISTENERS (Updated Selectors) ---
    if (loginBtn) loginBtn.addEventListener('click', () => showModal(loginModal));
    if (registerBtn) registerBtn.addEventListener('click', () => showModal(registerModal));
    if (homeLink) homeLink.addEventListener('click', (e) => { e.preventDefault(); fetchAndRenderPosts(); });

    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        state.token = null;
        state.user = null;
        localStorage.removeItem('blogToken');
        localStorage.removeItem('blogUser');
        updateUIForAuthState();
        fetchAndRenderPosts(); // Re-fetch posts to hide auth controls
    });

    if (createPostNavBtn) createPostNavBtn.addEventListener('click', () => {
        document.getElementById('post-modal-title').textContent = 'Create a New Post';
        postForm.reset();
        document.getElementById('post-id').value = '';
        imagePreview.src = '#';
        imagePreviewContainer.classList.add('hidden');
        showModal(postModal);
    });

    if (postImageInput) postImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreviewContainer.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    // --- FORM SUBMISSIONS (Same Logic) ---
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        try {
            errorDiv.textContent = '';
            const data = await apiRequest('/auth/login', 'POST', { email, password });
            state.token = data.token;
            // Decode token to get user info (assumes JWT structure)
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            state.user = { email: payload.sub, id: payload.userId, name: payload.name };
            localStorage.setItem('blogToken', state.token);
            localStorage.setItem('blogUser', JSON.stringify(state.user));
            updateUIForAuthState();
            hideModal(loginModal);
        } catch (error) {
            errorDiv.textContent = `Login failed: ${error.message}`;
        }
    });

    if (registerForm) registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        try {
            errorDiv.textContent = '';
            await apiRequest('/auth/register', 'POST', { name, email, password });
            hideModal(registerModal);
            showModal(loginModal); // Show login modal after successful registration
            document.getElementById('login-email').value = email; // Pre-fill email
        } catch (error) {
            errorDiv.textContent = `Registration failed: ${error.message}`;
        }
    });

    if (postForm) postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('post-error');
        errorDiv.textContent = '';
        const submitBtn = postForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        try {
            let imageUrl = document.getElementById('post-image-url').value || null;
            const imageFile = postImageInput.files[0];

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                // Note: File upload endpoint might be different from JSON API
                const uploadResponse = await fetch(`${state.apiBaseUrl}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${state.token}` },
                    body: formData
                });
                if (!uploadResponse.ok) {
                    const err = await uploadResponse.json();
                    throw new Error(err.message || 'Image upload failed!');
                }
                const result = await uploadResponse.json();
                imageUrl = result.url; // Assumes backend returns { "url": "..." }
            }

            const postId = document.getElementById('post-id').value;
            const postData = {
                title: document.getElementById('post-title').value,
                content: document.getElementById('post-content').value,
                categoryId: document.getElementById('post-category').value,
                imageUrl: imageUrl
            };

            if (postId) {
                await apiRequest(`/posts/${postId}`, 'PUT', postData, true);
            } else {
                await apiRequest('/posts', 'POST', postData, true);
            }
            hideModal(postModal);
            await fetchAndRenderPosts(); // Refresh post list
        } catch (error) {
            errorDiv.textContent = `Failed to save post: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
        }
    });

    // --- DYNAMIC EVENT LISTENERS (for clicks on posts, comments, etc.) ---
    document.body.addEventListener('click', async (e) => {
        
        // --- Click on a post link (title or read more) ---
        const postLink = e.target.closest('.post-link');
        if (postLink) {
            e.preventDefault();
            const postId = postLink.dataset.postId;
            await fetchAndRenderSinglePost(postId);
        }

        // --- Click on 'Edit Post' ---
        if (e.target.matches('.edit-post-btn')) {
            const postId = e.target.dataset.postId;
            const postToEdit = await apiRequest(`/posts/${postId}`);
            if (postToEdit) {
                document.getElementById('post-modal-title').textContent = 'Edit Post';
                document.getElementById('post-id').value = postToEdit.id;
                document.getElementById('post-title').value = postToEdit.title;
                document.getElementById('post-content').value = postToEdit.content;
                document.getElementById('post-category').value = postToEdit.category.id;
                document.getElementById('post-image-url').value = postToEdit.imageUrl || '';
                
                if (postToEdit.imageUrl) {
                    const fullImageUrl = postToEdit.imageUrl.startsWith('http') 
                        ? postToEdit.imageUrl 
                        : `${state.apiBaseUrl.replace('/api', '')}${postToEdit.imageUrl}`;
                    imagePreview.src = fullImageUrl;
                    imagePreviewContainer.classList.remove('hidden');
                } else {
                    imagePreview.src = '#';
                    imagePreviewContainer.classList.add('hidden');
                }
                showModal(postModal);
            }
        }

        // --- Click on 'Delete Post' ---
        if (e.target.matches('.delete-post-btn')) {
            const postId = e.target.dataset.postId;
            if (confirm('Are you sure you want to delete this post?')) {
                try {
                    await apiRequest(`/posts/${postId}`, 'DELETE', null, true);
                    // If on single post view, go home. Otherwise, refresh list.
                    if (!singlePostView.classList.contains('hidden')) {
                        await fetchAndRenderPosts();
                    } else {
                        await fetchAndRenderPosts(document.querySelector('.category-btn.active').dataset.categoryId);
                    }
                } catch (error) {
                    alert(`Failed to delete post: ${error.message}`);
                }
            }
        }

        // --- Click on a category button ---
        if (e.target.matches('.category-btn')) {
            const categoryId = e.target.dataset.categoryId;
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('inactive');
            });
            e.target.classList.add('active');
            e.target.classList.remove('inactive');
            await fetchAndRenderPosts(categoryId === 'all' ? null : categoryId);
        }
        
        // --- Click 'login' from comment section ---
        if (e.target.matches('#login-from-comment')) {
            showModal(loginModal);
        }
    });

    // --- Comment form submission (only listens on singlePostView) ---
    if (singlePostView) singlePostView.addEventListener('submit', async (e) => {
        if (e.target.matches('#comment-form')) {
            e.preventDefault();
            const content = document.getElementById('comment-content').value;
            try {
                await apiRequest(`/posts/${state.currentPost.id}/comments`, 'POST', { content }, true);
                document.getElementById('comment-content').value = ''; // Clear form
                await fetchAndRenderSinglePost(state.currentPost.id); // Refresh post
            } catch (error) {
                alert(`Failed to add comment: ${error.message}`);
            }
        }
    });

    // --- INITIALIZATION ---
    async function fetchAndRenderPosts(categoryId = null) {
        try {
            const endpoint = categoryId ? `/posts?categoryId=${categoryId}` : '/posts';
            state.posts = await apiRequest(endpoint);
            renderAllPosts();
        } catch (error) {
            if (postsContainer) postsContainer.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}. Is the backend running?</p>`;
        }
    }

    async function fetchAndRenderSinglePost(postId) {
        try {
            state.currentPost = await apiRequest(`/posts/${postId}`);
            renderSinglePost();
            window.scrollTo(0, 0); // Scroll to top to see the post
        } catch (error) {
            singlePostView.innerHTML = `<p style="color: red;">Error loading post: ${error.message}</p>`;
        }
    }

    async function fetchAndRenderCategories() {
        if (!categoriesContainer) return; // Guard clause
        try {
            if (state.categories.length === 0) {
                state.categories = await apiRequest('/categories');
            }
            renderCategories();
        } catch (error) {
            console.error("Could not load categories", error);
        }
    }

    function checkPersistedLogin() {
        const token = localStorage.getItem('blogToken');
        const userJson = localStorage.getItem('blogUser');
        if (token && userJson) {
            state.token = token;
            state.user = JSON.parse(userJson);
        }
    }

    async function initializeApp() {
        checkPersistedLogin();
        await Promise.all([
            fetchAndRenderPosts(),
            populateCategoriesDropdown(),
            fetchAndRenderCategories()
        ]);
        updateUIForAuthState();
    }

    initializeApp();
});
