// Global chart objects
        let charts = {};

        document.addEventListener('DOMContentLoaded', function() {
            let currentInterval = 'month';
            initCharts(currentInterval);
            setupIntervalButtons();
        });

        function setupIntervalButtons() {
            const timeButtons = document.querySelectorAll('.time-btn');
            timeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Update active button
                    timeButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Get interval and reload charts
                    currentInterval = this.dataset.interval;
                    initCharts(currentInterval);
                });
            });
        }

        function initCharts(interval) {
            // User Statistics
            fetchUserGrowth(interval);
            fetchUserStatusDistribution();
            fetchVerificationRate();
            
            // Document Request Metrics
            fetchRequestStatusDistribution();
            fetchRequestVolume(interval);
            fetchMostRequestedDocuments();
            
            // Financial Analysis
            fetchRevenueByDocumentType();
            fetchPaymentMethodDistribution();
            fetchRevenueTrends(interval);
            
            // Application Processing
            fetchApplicationStatusDistribution();
            fetchApplicationProcessingTime();
        }

        // User Growth Over Time
        function fetchUserGrowth(interval) {
            fetchStatisticsData('userGrowth', interval)
                .then(data => {
                    if (data.success) {
                        renderUserGrowthChart(data.data, interval);
                    }
                })
                .catch(error => console.error('Error fetching user growth data:', error));
        }

        function renderUserGrowthChart(data, interval) {
            const ctx = document.getElementById('userGrowthChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.userGrowthChart) {
                charts.userGrowthChart.destroy();
            }
            
            // Format labels based on interval
            const labels = data.map(item => {
                if (interval === 'day') return formatDate(item.date);
                if (interval === 'week') return 'Week ' + item.week.slice(-2);
                return formatYearMonth(item.month);
            });
            
            charts.userGrowthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'New Users',
                        data: data.map(item => item.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        // User Status Distribution
        function fetchUserStatusDistribution() {
            fetchStatisticsData('userStatusDistribution')
                .then(data => {
                    if (data.success) {
                        renderUserStatusChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching user status data:', error));
        }

        function renderUserStatusChart(data) {
            const ctx = document.getElementById('userStatusChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.userStatusChart) {
                charts.userStatusChart.destroy();
            }
            
            charts.userStatusChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.map(item => capitalizeFirstLetter(item.status)),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Verification Rate
        function fetchVerificationRate() {
            fetchStatisticsData('verificationRate')
                .then(data => {
                    if (data.success) {
                        renderVerificationRateChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching verification rate data:', error));
        }

        function renderVerificationRateChart(data) {
            const ctx = document.getElementById('verificationRateChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.verificationRateChart) {
                charts.verificationRateChart.destroy();
            }
            
            charts.verificationRateChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Verified', 'Not Verified'],
                    datasets: [{
                        data: [data.verified, data.not_verified],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 99, 132, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Request Status Distribution
        function fetchRequestStatusDistribution() {
            fetchStatisticsData('requestStatusDistribution')
                .then(data => {
                    if (data.success) {
                        renderRequestStatusChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching request status data:', error));
        }

        function renderRequestStatusChart(data) {
            const ctx = document.getElementById('requestStatusChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.requestStatusChart) {
                charts.requestStatusChart.destroy();
            }
            
            charts.requestStatusChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.map(item => capitalizeFirstLetter(item.status)),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: [
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Request Volume Over Time
        function fetchRequestVolume(interval) {
            fetchStatisticsData('requestVolume', interval)
                .then(data => {
                    if (data.success) {
                        renderRequestVolumeChart(data.data, interval);
                    }
                })
                .catch(error => console.error('Error fetching request volume data:', error));
        }

        function renderRequestVolumeChart(data, interval) {
            const ctx = document.getElementById('requestVolumeChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.requestVolumeChart) {
                charts.requestVolumeChart.destroy();
            }
            
            // Format labels based on interval
            const labels = data.map(item => {
                if (interval === 'day') return formatDate(item.date);
                if (interval === 'week') return 'Week ' + item.week.slice(-2);
                return formatYearMonth(item.month);
            });
            
            charts.requestVolumeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Request Volume',
                        data: data.map(item => item.count),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        // Most Requested Document Types
        function fetchMostRequestedDocuments() {
            fetchStatisticsData('mostRequestedDocuments')
                .then(data => {
                    if (data.success) {
                        renderRequestedDocTypesChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching most requested documents data:', error));
        }

        function renderRequestedDocTypesChart(data) {
            const ctx = document.getElementById('requestedDocTypesChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.requestedDocTypesChart) {
                charts.requestedDocTypesChart.destroy();
            }
            
            charts.requestedDocTypesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.document_type),
                    datasets: [{
                        label: 'Number of Requests',
                        data: data.map(item => item.count),
                        backgroundColor: 'rgba(153, 102, 255, 0.7)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        // Revenue by Document Type
        function fetchRevenueByDocumentType() {
            fetchStatisticsData('revenueByDocumentType')
                .then(data => {
                    if (data.success) {
                        renderRevenueByDocTypeChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching revenue by document type data:', error));
        }

        function renderRevenueByDocTypeChart(data) {
            const ctx = document.getElementById('revenueByDocTypeChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.revenueByDocTypeChart) {
                charts.revenueByDocTypeChart.destroy();
            }
            
            // Create a simplified dataset by combining all statuses
            const docTypes = [...new Set(data.map(item => item.document_type))];
            const combinedData = docTypes.map(docType => {
                const total = data
                    .filter(item => item.document_type === docType)
                    .reduce((sum, item) => sum + parseFloat(item.total_revenue), 0);
                return { document_type: docType, total_revenue: total };
            });
            
            charts.revenueByDocTypeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: combinedData.map(item => item.document_type),
                    datasets: [{
                        label: 'Revenue (₱)',
                        data: combinedData.map(item => item.total_revenue),
                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                footer: (tooltipItems) => {
                                    const docType = tooltipItems[0].label;
                                    const statusBreakdown = data
                                        .filter(item => item.document_type === docType)
                                        .map(item => `${item.status}: ₱${parseFloat(item.total_revenue).toFixed(2)}`)
                                        .join('\n');
                                    return `Status Breakdown:\n${statusBreakdown}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Payment Method Distribution
        function fetchPaymentMethodDistribution() {
            fetchStatisticsData('paymentMethodDistribution')
                .then(data => {
                    if (data.success) {
                        renderPaymentMethodChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching payment method data:', error));
        }

        function renderPaymentMethodChart(data) {
            const ctx = document.getElementById('paymentMethodChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.paymentMethodChart) {
                charts.paymentMethodChart.destroy();
            }
            
            charts.paymentMethodChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(item => formatPaymentMethod(item.mode_of_payment)),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Revenue Trends
        function fetchRevenueTrends(interval) {
            fetchStatisticsData('revenueTrends', interval)
                .then(data => {
                    if (data.success) {
                        renderRevenueTrendsChart(data.data, interval);
                    }
                })
                .catch(error => console.error('Error fetching revenue trends data:', error));
        }

        function renderRevenueTrendsChart(data, interval) {
            const ctx = document.getElementById('revenueTrendsChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.revenueTrendsChart) {
                charts.revenueTrendsChart.destroy();
            }
            
            // Format labels based on interval
            const labels = data.map(item => {
                if (interval === 'day') return formatDate(item.date);
                if (interval === 'week') return 'Week ' + item.week.slice(-2);
                return formatYearMonth(item.month);
            });
            
            charts.revenueTrendsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue (₱)',
                        data: data.map(item => item.revenue),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Application Status Distribution
        function fetchApplicationStatusDistribution() {
            fetchStatisticsData('applicationStatusDistribution')
                .then(data => {
                    if (data.success) {
                        renderApplicationStatusChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching application status data:', error));
        }

        function renderApplicationStatusChart(data) {
            const ctx = document.getElementById('applicationStatusChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.applicationStatusChart) {
                charts.applicationStatusChart.destroy();
            }
            
            charts.applicationStatusChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.map(item => capitalizeFirstLetter(item.status)),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: [
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // Application Processing Time
        function fetchApplicationProcessingTime() {
            fetchStatisticsData('applicationProcessingTime')
                .then(data => {
                    if (data.success) {
                        renderApplicationTimeChart(data.data);
                    }
                })
                .catch(error => console.error('Error fetching application processing time data:', error));
        }

        function renderApplicationTimeChart(data) {
            const ctx = document.getElementById('applicationTimeChart').getContext('2d');
            
            // Clear previous chart if it exists
            if (charts.applicationTimeChart) {
                charts.applicationTimeChart.destroy();
            }
            
            const processingHours = data.details.map(item => parseInt(item.processing_hours));
            
            // Create histogram data
            const maxHours = Math.max(...processingHours);
            const binSize = Math.ceil(maxHours / 10); // Create 10 bins
            const bins = Array(10).fill(0);
            
            processingHours.forEach(hours => {
                const binIndex = Math.min(Math.floor(hours / binSize), 9);
                bins[binIndex]++;
            });
            
            const binLabels = bins.map((_, i) => 
                `${i * binSize}-${(i + 1) * binSize} hours`
            );
            
            charts.applicationTimeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: binLabels,
                    datasets: [{
                        label: 'Number of Applications',
                        data: bins,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                footer: () => {
                                    return `Average processing time: ${data.average_hours.toFixed(2)} hours`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Helper function to fetch data from the server
        function fetchStatisticsData(action, interval = null) {
            const formData = new FormData();
            formData.append('action', action);
            if (interval) {
                formData.append('interval', interval);
            }
            
            return fetch('php/admin/admin-reports/fetch-chart-data.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log('Data fetched successfully for action:', action);
                return response.json();
            })
            .then(data => {
                // Log response data for debugging
                console.log(`Response data for ${action}:`, data);
                return data;
            });
        }

        // Helper functions for formatting
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        function formatYearMonth(yearMonth) {
            const [year, month] = yearMonth.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function formatPaymentMethod(method) {
            switch (method.toLowerCase()) {
                case 'credit-card':
                    return 'Credit Card';
                case 'gcash':
                    return 'GCash';
                default:
                    return method.split('-').map(capitalizeFirstLetter).join(' ');
            }
        }
