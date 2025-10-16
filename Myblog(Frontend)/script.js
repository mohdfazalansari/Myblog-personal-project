document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        token: null,
        user: null,
        posts: [],
        categories: [],
        currentPost: null,
        apiBaseUrl: 'http://localhost:8080/api'
    };

    // --- SELECTORS ---
    const allPostsView = document.getElementById('all-posts-view');
    const singlePostView = document.getElementById('single-post-view');
    const postsContainer = document.getElementById('posts-container');
    // A selector for categories container seems to be missing in the HTML, 
    // but the JS references it. I'll add a placeholder check for it.
    const categoriesContainer = document.getElementById('categories-container');
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    const homeLink = document.querySelector('.logo'); // Changed to select the logo
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
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

    // --- API SERVICE ---
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

    // --- RENDER FUNCTIONS ---
    function renderAllPosts() {
        allPostsView.classList.remove('hidden');
        singlePostView.classList.add('hidden');
        postsContainer.innerHTML = '';
        if (state.posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-gray-500">No posts found.</p>';
            return;
        }

        state.posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'bg-white rounded-lg shadow-md overflow-hidden';
            const isAuthor = state.user && state.user.id === post.author.id;
            const authorControlsHTML = isAuthor ? `
                <div class="mt-4 pt-4 border-t flex justify-end space-x-3">
                    <button class="edit-post-btn text-sm text-blue-500 hover:underline" data-post-id="${post.id}">Edit ✏️</button>
                    <button class="delete-post-btn text-sm text-red-500 hover:underline" data-post-id="${post.id}">Delete 🗑️</button>
                </div>` : '';
            
            postCard.innerHTML = `
                ${post.imageUrl ? `<img src="http://localhost:8080${post.imageUrl}" alt="${post.title}" class="w-full h-48 object-contain bg-slate-100">` : ''}
                <div class="p-6">
                    <span class="text-sm text-indigo-500 font-semibold">${post.category.name}</span>
                    <h3 class="text-xl font-bold mt-2 mb-2 text-gray-800 cursor-pointer hover:text-indigo-600" data-post-id="${post.id}">${post.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">By ${post.author.name} on ${new Date(post.createdAt).toLocaleDateString()}</p>
                    <p class="text-gray-700 leading-relaxed">${post.content.substring(0, 100)}...</p>
                    ${authorControlsHTML}
                </div>`;
            postsContainer.appendChild(postCard);
        });
    }

    function renderSinglePost() {
        allPostsView.classList.add('hidden');
        singlePostView.classList.remove('hidden');
        const post = state.currentPost;
        if (!post) return;

        const isAuthor = state.user && state.user.id === post.author.id;

        singlePostView.innerHTML = `
            ${post.imageUrl ? `<img src="http://localhost:8080${post.imageUrl}" alt="${post.title}" class="w-full h-96 object-contain bg-slate-100 rounded-lg shadow-lg mb-8">` : ''}
            <div class="bg-white p-8 rounded-lg shadow-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-4xl font-bold text-gray-900">${post.title}</h2>
                        <p class="text-md text-gray-500 mt-2">By ${post.author.name} in <span class="font-semibold text-indigo-500">${post.category.name}</span></p>
                        <p class="text-sm text-gray-400">Posted on ${new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                    ${isAuthor ? `
                    <div class="flex space-x-2">
                        <button class="edit-post-btn text-blue-500 hover:underline" data-post-id="${post.id}">Edit</button>
                        <button class="delete-post-btn text-red-500 hover:underline" data-post-id="${post.id}">Delete</button>
                    </div>` : ''}
                </div>
                <div class="prose max-w-none mt-8 text-gray-800">${post.content.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="mt-12">
                <h3 class="text-2xl font-bold mb-6">Comments (${post.comments ? post.comments.length : 0})</h3>
                <div id="comments-list" class="space-y-6">
                    ${post.comments && post.comments.map(comment => `
                        <div class="bg-white p-4 rounded-lg shadow">
                            <p class="text-gray-800">${comment.content}</p>
                            <p class="text-xs text-gray-400 mt-2">By ${comment.author.name} on ${new Date(comment.createdAt).toLocaleString()}</p>
                        </div>
                    `).join('')}
                    ${!post.comments || post.comments.length === 0 ? '<p class="text-gray-500">No comments yet.</p>' : ''}
                </div>
                
                ${state.token ? `
                <form id="comment-form" class="mt-8">
                    <h4 class="text-lg font-semibold mb-2">Leave a Comment</h4>
                    <textarea id="comment-content" rows="4" required class="w-full p-2 border rounded-md" placeholder="Write your comment..."></textarea>
                    <button type="submit" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Submit Comment</button>
                </form>` : '<p class="mt-8 text-gray-600">You must be <span id="login-from-comment" class="text-indigo-600 cursor-pointer hover:underline">logged in</span> to comment.</p>'}
            </div>`;
    }

    function renderCategories() {
        if (!categoriesContainer) return; // Guard clause
        categoriesContainer.innerHTML = '';
        const allButton = document.createElement('button');
        allButton.className = 'category-btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition';
        allButton.textContent = 'All Posts';
        allButton.dataset.categoryId = 'all';
        categoriesContainer.appendChild(allButton);

        state.categories.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.className = 'category-btn bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition';
            categoryButton.textContent = category.name;
            categoryButton.dataset.categoryId = category.id;
            categoriesContainer.appendChild(categoryButton);
        });
    }

    function updateUIForAuthState() {
        if (state.token) {
            authLinks.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userInfo.classList.add('flex');
            userEmailSpan.textContent = state.user.email;
        } else {
            authLinks.classList.remove('hidden');
            userInfo.classList.add('hidden');
            userEmailSpan.textContent = '';
        }
        if (!singlePostView.classList.contains('hidden')) renderSinglePost();
        if (!allPostsView.classList.contains('hidden')) renderAllPosts();
    }

    async function populateCategoriesDropdown() {
        try {
            if (state.categories.length === 0) {
                 state.categories = await apiRequest('/categories');
            }
            const categorySelect = document.getElementById('post-category');
            categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
            state.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    }

    function showModal(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    function hideModal(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => hideModal(e.target.closest('.modal-backdrop')));
    });

    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
    homeLink.addEventListener('click', (e) => { e.preventDefault(); fetchAndRenderPosts(); });

    logoutBtn.addEventListener('click', () => {
        state.token = null;
        state.user = null;
        localStorage.removeItem('blogToken');
        localStorage.removeItem('blogUser');
        window.location.hash = '';
        updateUIForAuthState();
        fetchAndRenderPosts();
    });

    createPostNavBtn.addEventListener('click', () => {
        document.getElementById('post-modal-title').textContent = 'Create a New Post';
        postForm.reset();
        document.getElementById('post-id').value = '';
        imagePreview.src = '#';
        imagePreviewContainer.classList.add('hidden');
        showModal(postModal);
    });

    postImageInput.addEventListener('change', (e) => {
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

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        try {
            errorDiv.textContent = '';
            const data = await apiRequest('/auth/login', 'POST', { email, password });
            state.token = data.token;
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

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');
        try {
            errorDiv.textContent = '';
            await apiRequest('/auth/register', 'POST', { name, email, password });
            hideModal(registerModal);
            showModal(loginModal);
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = '';
        } catch (error) {
            errorDiv.textContent = `Registration failed: ${error.message}`;
        }
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('post-error');
        errorDiv.textContent = '';
        const submitBtn = document.querySelector('#post-form button[type="submit"]');
        submitBtn.disabled = true;
        
        try {
            let imageUrl = document.getElementById('post-image-url').value || null;
            const imageFile = postImageInput.files[0];

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
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
                imageUrl = result.url;
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
            await fetchAndRenderPosts();
        } catch (error) {
            errorDiv.textContent = `Failed to save post: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.body.addEventListener('click', async (e) => {
        if (e.target.matches('h3[data-post-id]')) {
            const postId = e.target.dataset.postId;
            await fetchAndRenderSinglePost(postId);
        }

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
                    imagePreview.src = `http://localhost:8080${postToEdit.imageUrl}`;
                    imagePreviewContainer.classList.remove('hidden');
                } else {
                    imagePreview.src = '#';
                    imagePreviewContainer.classList.add('hidden');
                }
                showModal(postModal);
            }
        }

        if (e.target.matches('.delete-post-btn')) {
            const postId = e.target.dataset.postId;
            if (confirm('Are you sure you want to delete this post?')) {
                try {
                    await apiRequest(`/posts/${postId}`, 'DELETE', null, true);
                    await fetchAndRenderPosts();
                } catch (error) {
                    alert(`Failed to delete post: ${error.message}`);
                }
            }
        }

        if (e.target.matches('.category-btn')) {
            const categoryId = e.target.dataset.categoryId;
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-800');
            });
            e.target.classList.add('bg-indigo-600', 'text-white');
            e.target.classList.remove('bg-gray-200', 'text-gray-800');
            await fetchAndRenderPosts(categoryId === 'all' ? null : categoryId);
        }
        
        if (e.target.matches('#login-from-comment')) {
            showModal(loginModal);
        }
    });

    singlePostView.addEventListener('submit', async (e) => {
        if (e.target.matches('#comment-form')) {
            e.preventDefault();
            const content = document.getElementById('comment-content').value;
            try {
                await apiRequest(`/posts/${state.currentPost.id}/comments`, 'POST', { content }, true);
                document.getElementById('comment-content').value = '';
                await fetchAndRenderSinglePost(state.currentPost.id);
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
            postsContainer.innerHTML = `<p class="text-red-500">Error loading posts: ${error.message}. Is the backend running?</p>`;
        }
    }

    async function fetchAndRenderSinglePost(postId) {
        try {
            state.currentPost = await apiRequest(`/posts/${postId}`);
            renderSinglePost();
        } catch (error) {
            singlePostView.innerHTML = `<p class="text-red-500">Error loading post: ${error.message}</p>`;
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

