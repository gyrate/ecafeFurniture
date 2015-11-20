<?php
/**
 * Created by IntelliJ IDEA.
 * User: zhanglinhai
 * Date: 14-11-11
 * Time: 下午3:17
 */

$fn = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);
if ($fn) {
    file_put_contents(
        'uploads/' . $fn,
        file_get_contents('php://input')
    );
    echo 'http://'.$_SERVER['HTTP_HOST'] .'/ecafe/src/php/uploads/'.$fn ;
}else{
    /*表单提交*/
    for( $i=0, $len = count($_FILES['attach']['name']); $i < $len ; $i++ ){
        move_uploaded_file( $_FILES["attach"]["tmp_name"][$i],  "uploads/" . $_FILES["attach"]["name"][$i] );
        echo " file name:" .$_FILES['attach']['name'][$i] .'     '.$_FILES['attach']['size'][$i] ."KB <br/>";
    }
}
exit();

?>
