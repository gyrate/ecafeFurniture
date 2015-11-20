<?php header('Content-type: text/json');

$output;

if( !empty($_POST['ky']) ){

     switch($_POST['ky']){
        case 'a':
            $output = array (
                array( "value"  => 1 ,"label" => 'a' ),
                array( "value"  => 2 ,"label" => 'apple' ),
                array( "value"  => 3 ,"label" => 'abandon' ),
                array( "value"  => 4 ,"label" => 'abccordate' ),
                array( "value"  => 5 ,"label" => 'application' ),
                array( "value"  => 6 ,"label" => 'argument' ),
                array( "value"  => 7 ,"label" => 'affter' ),
                array( "value"  => 8 ,"label" => 'apology' )
            );
            break;
        case 'ab':
            $output = array (
                array( "value"  => 1 ,"label" => 'abandon' ),
                array( "value"  => 2 ,"label" => 'abccordate' ),
                array( "value"  => 3 ,"label" => 'abcplication' )
            );
            break;
        case 'abc':
            $output = array (
                array( "value"  => 1 ,"label" => 'abccordate' ),
                array( "value"  => 2 ,"label" => 'abcplication' )
            );
            break;
        case 'abcd':
            $output = array (
                array( "value"  => 1 ,"label" => 'abccdordate' )
            );
            break;
        default:
            $output = array (
                array( "value"  => 0 ,"label" => 'whatever else' ),
                array( "value"  => 1 ,"label" => 'a' ),
                array( "value"  => 2 ,"label" => 'apple' ),
                array( "value"  => 3 ,"label" => 'abandon' ),
                array( "value"  => 4 ,"label" => 'abccordate' ),
                array( "value"  => 5 ,"label" => 'application' ),
                array( "value"  => 6 ,"label" => 'argument' ),
                array( "value"  => 7 ,"label" => 'affter' ),
                array( "value"  => 8 ,"label" => 'apology' )
            );
            break;
     }

}else{
     $output = array (
        array( "value"  => 1 ,"label" => '苹果'),
        array( "value"  => 2 ,"label" => '橘子'),
        array( "value"  => 3 ,"label" => '香蕉'),
        array( "value"  => 4 ,"label" => '芒果'),
        array( "value"  => 5 ,"label" => '桃子'),
        array( "value"  => 6 ,"label" => '雪梨'),
        array( "value"  => 7 ,"label" => '西柚'),
        array( "value"  => 8 ,"label" => '番木瓜'),
        array( "value"  => 9 ,"label" => '枇杷'),
        array( "value"  => 10 ,"label" => '荔枝')
     );

}
sleep(0);

echo json_encode( $output );
?>
