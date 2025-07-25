<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/get_donations.php';

$getAllDonations = new Donation();

$response = $getAllDonations->getAllDonations();
echo json_encode($response);

?>
