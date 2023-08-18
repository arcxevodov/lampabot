<?php
require_once 'Censure.php';

$db = new SQLite3('db.sqlite');
$token = $db->querySingle('SELECT * FROM secret');

if ($_GET['token'] != $token) {
    http_response_code(401);
    echo 'Ошибка авторизации';
    die();
}

unset($db);

switch ($_GET['query']) {
    case 'check':
        censureCheck();
        break;
    case 'set_score':
        addScore();
        break;
    case 'get_score':
        getScore();
        break;
    case 'get_rating':
        getRating();
        break;
    case 'add_me':
        addMe();
        break;
}

function censureCheck(): void
{
    if ($_GET['data']) {
        $data = $_GET['data'];
        $parse_result = Censure::parse($data);
        if ($parse_result) {
            http_response_code(200);
        } else {
            http_response_code(404);
        }
        die();
    }
}

function addScore(): void
{
    if ($_GET['user_id']) {
        $user_id = $_GET['user_id'];
        $username = $_GET['username'];
        $full_name = $_GET['full_name'];
        $db = new SQLite3('db.sqlite');
        $user_count = $db->querySingle('SELECT count FROM users WHERE id = ' . $_GET['user_id']);
        if ($user_count !== null) {
            $db->exec('UPDATE users SET count = ' . $user_count + 7 . ' WHERE id = ' . $_GET['user_id']);
        } else {
            $db->exec("INSERT INTO users VALUES ('$user_id', '$username', '$full_name', 7)");
        }
        http_response_code(200);
        die();
    }
}

function getScore(): void
{
    if ($_GET['user_id']) {
        $db = new SQLite3('db.sqlite');
        $user_count = $db->querySingle('SELECT count FROM users WHERE id = ' . $_GET['user_id']);
        http_response_code(200);
        echo $user_count;
    }
}

function getRating(): void
{
    $db = new SQLite3('db.sqlite');
    $rating = $db->query('SELECT * FROM users ORDER BY count');
    $res = [];
    while ($result = $rating->fetchArray(SQLITE3_ASSOC)) {
        $res[] = $result;
    }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($res);
}

function addMe(): void
{
    if ($_GET['user_id']) {
        $user_id = $_GET['user_id'];
        $username = $_GET['username'];
        $full_name = $_GET['full_name'];
        $db = new SQLite3('db.sqlite');
        $db->exec("INSERT INTO users VALUES ('$user_id', '$username', '$full_name', 0)");
        http_response_code(200);
        die();
    }
}