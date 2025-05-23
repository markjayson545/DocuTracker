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

            const response = await fetch(`php/client/search-query.php?action=searchAll&value=${encodeURIComponent(searchTerm)}`);
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

        results.forEach((result) => {
            let resultElement = null;

            if (result.type === 'request') {
                const requestTemplate = `
                    <div class="search-result-item" data-id="${result.id}" data-type="request">
                        <i class="fas fa-file-alt"></i>
                        <div class="search-result-details">
                            <p class="result-title">Document Request</p>
                            <p class="result-meta">Request • REQ-${result.id} • ${result.status}</p>
                        </div>
                    </div>`;
                searchResultContainer.insertAdjacentHTML('beforeend', requestTemplate);
                resultElement = searchResultContainer.lastElementChild;
            }

            if (resultElement) {
                activeResults.push(resultElement);

                // Add click event listener
                resultElement.addEventListener('click', () => {
                    const id = resultElement.getAttribute('data-id');
                    const type = resultElement.getAttribute('data-type');
                    navigateToDetail(id, type);
                });
            }
        });

        // Show the dropdown
        searchResultsDropdown.style.display = 'block';
    }

    // Function to navigate to detail page based on result type
    function navigateToDetail(id, type) {
        console.log(`Navigating to ${type} detail with ID: ${id}`);
        switch (type) {
            case 'request':
                // Navigate to request details page
                window.location.href = `user-request-history.html?id=${id}`;
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
});
