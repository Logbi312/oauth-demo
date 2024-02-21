<?php

// Include your MySQL connection setup
$db = new mysqli('localhost', 'root', '', 'mask_link');

// Check for connection errors
if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

// Check if both userId and accessToken query parameters are set
if (isset($_GET['userId']) && isset($_GET['accessToken'])) {
    // Retrieve the userId and accessToken from the query parameters
    $userId = $_GET['userId'];
    $accessToken = $_GET['accessToken'];

    // Query the database to check if the access token exists and is associated with the provided user ID
    $sql = "SELECT * FROM tokens WHERE user_id = ? AND access_token = ?";
    $stmt = $db->prepare($sql);
    $stmt->bind_param("ss", $userId, $accessToken);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if the access token exists and is associated with the provided user ID in the database
    if ($result->num_rows > 0) {
        // Display success message if the access token is valid for the provided user ID
        echo 'Success: User redirected from Node.js with valid access token for the provided user ID';
    } else {
        // Display failure message if the access token is not valid for the provided user ID
        echo 'Failed: Invalid access token for the provided user ID';
    }
} else {
    // Display failure message if either userId or accessToken query parameter is missing
    echo 'Failed: Missing userId or accessToken';
}

// Close the database connection
$db->close();

?>
