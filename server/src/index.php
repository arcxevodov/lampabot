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
        $db = new SQLite3('db.sqlite');
        $user_count = $db->querySingle('SELECT count FROM users WHERE id = ' . $_GET['user_id']);
        if ($user_count !== null) {
            $db->exec('UPDATE users SET count = ' . $user_count + 7 . ' WHERE id = ' . $_GET['user_id']);
        } else {
            $db->exec('INSERT INTO users VALUES (' . $_GET['user_id'] . ', 0)');
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