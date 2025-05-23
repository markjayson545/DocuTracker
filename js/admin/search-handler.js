document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const searchResultContainer = document.getElementById("search-results-list");
    const searchResultsDropdown = document.getElementById("search-results-dropdown");

    // Search message reference
    const searchMessage = document.getElementById("search-message");

    // Track active result elements
    let activeResults = [];

    // Add debounce function to prevent too many API calls
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // Function to perform search
    const performSearch = debounce(async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 1) {
            clearResults();
            searchMessage.textContent = 'Type at least 1 characters to search';
            searchMessage.style.display = 'block';
            return;
        }

        try {
            clearResults();
            searchMessage.textContent = 'Searching...';
            searchMessage.style.display = 'block';

            const response = await fetch(`php/admin/search-query.php?action=searchAll&value=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            console.log("Search results:", data);

            if (!data.success) {
                searchMessage.textContent = `Error: ${data.message}`;
                return;
            }

            displaySearchResults(data.data);
        } catch (error) {
            console.error("Search failed:", error);
            searchMessage.textContent = 'Search failed. Please try again.';
        }
    }, 500);

    // Clear all active search results
    function clearResults() {
        // Hide all active results
        activeResults.forEach(result => {
            result.style.display = 'none';
        });
        activeResults = [];
    }

    // Function to display search results
    function displaySearchResults(results) {
        clearResults();

        if (!results || results.length === 0) {
            searchMessage.textContent = 'No results found';
            searchMessage.style.display = 'block';
            return;
        }

        searchMessage.style.display = 'none';

        results.forEach((result, index) => {
            let resultElement = null;

            if (result.type === 'user') {
                const userTemplate = `
                    <div class="search-result-item" data-id="${result.user_id}" data-type="user">
                        <i class="fas fa-user"></i>
                        <div class="search-result-details">
                            <p class="result-title">${result.username}</p>
                            <p class="result-meta">User-${result.user_id} • ${result.email}</p>
                        </div>
                    </div>`;
                searchResultContainer.insertAdjacentHTML('beforeend', userTemplate);
                resultElement = searchResultContainer.lastElementChild;
            } else if (result.type === 'request') {
                const requestTemplate = `
                    <div class="search-result-item" data-id="${result.id}" data-type="request" data-user-id="${result.user_id}">
                        <i class="fas fa-file-alt"></i>
                        <div class="search-result-details">
                            <p class="result-title">Document Request</p>
                            <p class="result-meta">Request • REQ-${result.id} • ${result.status}</p>
                        </div>
                    </div>`;
                searchResultContainer.insertAdjacentHTML('beforeend', requestTemplate);
                resultElement = searchResultContainer.lastElementChild;
            } else if (result.type === 'application') {
                const applicationTemplate = `
                    <div class="search-result-item" data-id="${result.id}" data-type="application" data-user-id="${result.user_id}">
                        <i class="fas fa-clipboard-list"></i>
                        <div class="search-result-details">
                            <p class="result-title">Application</p>
                            <p class="result-meta">Application • APP-${result.id} • ${result.status}</p>
                        </div>
                    </div>`;
                searchResultContainer.insertAdjacentHTML('beforeend', applicationTemplate);
                resultElement = searchResultContainer.lastElementChild;
            }

            if (resultElement) {
                activeResults.push(resultElement);

                // Add click event listener
                resultElement.addEventListener('click', () => {
                    const id = resultElement.getAttribute('data-id');
                    const type = resultElement.getAttribute('data-type');
                    const userId = resultElement.getAttribute('data-user-id');
                    navigateToDetail(id, type, userId);
                });
            }
        });

        // Show the dropdown
        searchResultsDropdown.style.display = 'block';
    }

    // Function to navigate to detail page based on result type
    function navigateToDetail(id, type, userId) {
        console.log(`Navigating to ${type} detail with ID: ${id}, User ID: ${userId}`);
        switch (type) {
            case 'user':
                window.location.href = `admin-manage-users.html?id=${id}`;
                break;
            case 'request':
                window.location.href = `admin-manage-requests.html?id=${id}&userId=${userId}`;
                break;
            case 'application':
                window.location.href = `admin-manage-applications.html?id=${id}&userId=${userId}`;
                break;
            default:
                console.error('Unknown result type:', type);
        }
    }

    // Add search input event listener with debounce
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.trim();
        performSearch(searchTerm);
    });

    // Show/hide search dropdown based on focus
    searchInput.addEventListener("focus", function () {
        searchResultsDropdown.style.display = 'block';
    });

    // Hide dropdown when clicking elsewhere
    document.addEventListener("click", function (event) {
        if (!searchInput.contains(event.target) &&
            !searchResultsDropdown.contains(event.target)) {
            searchResultsDropdown.style.display = 'none';
        }
    });

    // Function to perform specific type of search
    window.performSpecificSearch = function (type, searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return;

        clearResults();
        searchMessage.textContent = 'Searching...';
        searchMessage.style.display = 'block';

        fetch(`php/admin/search-query.php?action=search${type}&value=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                console.log(`Specific ${type} search results:`, data);
                if (data.success) {
                    // Add type property for proper display
                    const typedData = data.data.map(item => ({ ...item, type: type.toLowerCase() }));
                    displaySearchResults(typedData);
                } else {
                    searchMessage.textContent = `Error: ${data.message}`;
                    searchMessage.style.display = 'block';
                }
            })
            .catch(error => {
                console.error(`${type} search failed:`, error);
                searchMessage.textContent = 'Search failed. Please try again.';
                searchMessage.style.display = 'block';
            });
    };
});