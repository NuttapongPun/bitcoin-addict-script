# bitcoin-addict-script

This project contains the code necessary to connect a Strapi backend to a Webflow website and fetch content, specifically tailored for a "Bitcoin Addict" themed site.

## Purpose

The primary goal of this script is to dynamically display content from a Strapi CMS on a Webflow page. This allows for easy content management and updates via Strapi, while maintaining the design and structure within Webflow.

## Technologies Used

- **Webflow:** For website design and hosting.
- **Strapi:** For content management and API creation.
- **JavaScript:** For fetching and displaying data.
- **Fetch API:** For making HTTP requests to the Strapi API.

## Implementation Details

1.  **Strapi Setup:**

    - Ensure your Strapi instance is running and accessible.
    - Create the necessary content types in Strapi (e.g., articles, blog posts, etc.).
    - Enable public access to the required API endpoints.

2.  **Webflow Custom Code:**

    - Copy the provided JavaScript code into the "Custom Code" section of your Webflow page.
    - Modify the script to match your Strapi API endpoint and the desired content fields.
    - Use Webflow's HTML Embed element to create placeholders for the dynamic content.

3.  **JavaScript Logic:**
    - The JavaScript code uses the `fetch` API to retrieve data from the Strapi API.
    - The retrieved data is then parsed and dynamically inserted into the corresponding HTML elements within the Webflow page.
    - Error handling is included to manage potential issues with the API request.
