<?php header('Content-type: text/json');

$output;

if( !empty($_POST['key']) ){

     $output = array (
        array(
            "value"  => 1 ,
            "desc" => '苹果'
        ),
        array(
            "value"  => 2 ,
            "desc" => '红苹果'
        ),
        array(
            "value"  => 3 ,
            "desc" => '绿苹果'
        ),
        array(
            "value"  => 3 ,
            "desc" => '银苹果'
        ),
        array(
            "value"  => 3 ,
            "desc" => '金苹果'
        ),
        array(
            "value"  => 3 ,
            "desc" => '粉苹果'
        ),
        array(
            "value"  => 3 ,
            "desc" => '脆苹果'
        ),
        array(
            "value"  => 3 ,
            "desc" => '青苹果'
        )
     );

}else{
     $output = array (
        array(
            "value"  => 1 ,
            "desc" => '苹果'
        ),
        array(
            "value"  => 4 ,
            "desc" => '狗仔队'
        ),
        array(
            "value"  => 5 ,
            "desc" => '金苹果'
        ),
        array(
            "value"  => 6 ,
            "desc" => '耳朵'
        ),
        array(
            "value"  => 7 ,
            "desc" => '朋友'
        ),
        array(
            "value"  => 8 ,
            "desc" => '兰花'
        ),
        array(
            "value"  => 9 ,
            "desc" => '大熊猫'
        )
     );

}

echo json_encode( $output );
?>
