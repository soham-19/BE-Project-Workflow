document.getElementById('workflowForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    showLoadingSpinner(true);
    document.getElementById('resetButton').classList.add('d-none');
    document.getElementById('workflowStatus').innerHTML = '';

    // Start the workflow steps
    await processStepWithLink('Generating transcript...', 'View Text Transcript', 'info', 2000, 'transcript.csv');
    await processStepWithLink('Extracting features...', '', 'info', 2000, 'features.csv');
    await processStepWithLink('Building features.csv...', 'View Extracted Features', 'info', 2000, 'features.csv');
    await processStepWithLink('Predicting target variables based on data...', 'View Training Data', 'info', 2000, 'combined_training.csv');

    // Add the final report step
    await processStepWithLink('Generating final report...', 'View Report', 'success', 2000, 'report.csv');

    showStatus('Report Generated successfully!', 'success');

    // Show the line chart and chart title after the workflow is complete
    document.getElementById('lineChart').style.display = 'block';  // Reveal the chart
    document.getElementById('chartTitle').style.display = 'block'; // Reveal the chart title

    submitButton.disabled = false;
    showLoadingSpinner(false);
    document.getElementById('resetButton').classList.remove('d-none');
});


document.getElementById('resetButton').addEventListener('click', function () {
    document.getElementById('workflowForm').reset();
    document.getElementById('workflowStatus').innerHTML = '';
    document.getElementById('resetButton').classList.add('d-none');
});

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}

async function processStepWithLink(message, content, className, delayTime, fileName) {
    const statusDiv = document.getElementById('workflowStatus');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${className} animate__animated animate__fadeIn`;
    alertDiv.role = 'alert';

    // Add the main text
    const span = document.createElement('span');
    span.textContent = `${message} `;

    // Add the "View Details" link for each step
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = `${content}`;
    link.className = 'btn btn-link p-0 align-baseline';
    link.setAttribute('data-bs-toggle', 'modal');
    link.setAttribute('data-bs-target', '#transcriptModal');
    link.addEventListener('click', function () {
        displayCSV(fileName);
    });

    // Append both text and link to the alert
    alertDiv.appendChild(span);
    alertDiv.appendChild(link);
    statusDiv.appendChild(alertDiv);

    await delay(delayTime);
}

function showStatus(message, className) {
    const statusDiv = document.getElementById('workflowStatus');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${className} animate__animated animate__fadeIn`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `<i class="fas fa-check"></i> ${message}`;
    statusDiv.appendChild(alertDiv);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function displayCSV(fileName) {
    try {
        const response = await fetch(fileName);
        const csvText = await response.text();
        const csvRows = csvText.split('\n').map(row => row.split(','));
        const table = document.createElement('table');
        table.className = 'table table-striped table-bordered animate__animated animate__fadeIn';

        // Set table width and other styles
        table.style.width = 'auto'; // Allow table to expand based on content
        table.style.tableLayout = 'auto'; // Allow columns to adjust based on content

        // Add table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        csvRows[0].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.whiteSpace = 'nowrap'; // Prevent header text from wrapping
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Add table body with scrollable 20 rows
        const tbody = document.createElement('tbody');
        const visibleRows = Math.min(csvRows.length - 1, 20); // Show a maximum of 20 rows
        for (let i = 1; i <= visibleRows; i++) {
            const row = csvRows[i];
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                td.style.whiteSpace = 'nowrap'; // Prevent cell text from wrapping
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        // Add a container for scrolling only for the body of the table (both horizontal and vertical scrolling)
        const tableContainer = document.createElement('div');
        tableContainer.style.maxHeight = '400px'; // Adjust as needed for the height
        tableContainer.style.overflowY = 'auto'; // Make tbody scrollable vertically
        tableContainer.style.overflowX = 'auto'; // Enable horizontal scrolling when columns are too wide
        tableContainer.style.width = '100%'; // Ensure the table container takes up full width
        tableContainer.appendChild(table);

        const transcriptContent = document.getElementById('transcriptContent');
        transcriptContent.innerHTML = ''; // Clear existing content
        transcriptContent.appendChild(tableContainer);

    } catch (error) {
        console.error('Error fetching or displaying CSV:', error);
    }
}

window.onload = function () {
    // Dummy data for the line graph (negative, neutral, positive speech)
    const labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Data for negative, neutral, and positive speech
    const negativeSpeechData = [20, 18, 15, 25, 30, 20, 10, 15, 25, 18];
    const neutralSpeechData = [30, 28, 25, 20, 15, 22, 30, 20, 18, 22];
    const positiveSpeechData = [50, 54, 60, 55, 55, 58, 60, 65, 57, 60];

    // Ensure the sum of negative, neutral, and positive speech is always 100
    // Adjusting values so that the total sum for each point is 100%
    const totalData = labels.map((_, index) => {
        const total = negativeSpeechData[index] + neutralSpeechData[index] + positiveSpeechData[index];
        const scale = 100 / total;
        return {
            negative: negativeSpeechData[index] * scale,
            neutral: neutralSpeechData[index] * scale,
            positive: positiveSpeechData[index] * scale,
        };
    });

    // Construct data for the chart
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Negative Speech',
                data: totalData.map(d => d.negative),
                borderColor: 'rgb(255, 99, 132)', // Red
                fill: false,
                tension: 0.4, // Curvy line
            },
            {
                label: 'Neutral Speech',
                data: totalData.map(d => d.neutral),
                borderColor: 'rgb(54, 162, 235)', // Blue
                fill: false,
                tension: 0.4, // Curvy line
            },
            {
                label: 'Positive Speech',
                data: totalData.map(d => d.positive),
                borderColor: 'rgb(75, 192, 192)', // Green
                fill: false,
                tension: 0.4, // Curvy line
            }
        ]
    };

    // Create the line chart
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Speech Percentage'
                    },
                    min: 0,
                    max: 100, // Y-axis from 0% to 100%
                }
            }
        }
    };

    // Adjust canvas size (width and height)
    const canvas = document.getElementById('lineChart');
    canvas.width = 800; // Width of the chart
    canvas.height = 400; // Height of the chart

    const lineChart = new Chart(
        canvas,
        config
    );
};
