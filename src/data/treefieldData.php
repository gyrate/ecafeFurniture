<?php
$arr = array(
     'children'=> array(
         array(
             'id'=>2,
             'nodeText'=>'我的工作台1',
             'nodeIconClass'=>'',
             'parentId'=>1,
             'expanded'=> 'true',
             'children'=>array(
                array(
                     'id'=>21,
                     'nodeText'=>'我的工作台21',
                     'nodeIconClass'=>'',
                     'parentId'=>2
                ) ,
                array(
                     'id'=>22,
                     'nodeText'=>'我的工作台22',
                     'nodeIconClass'=>'',
                     'parentId'=>2
                ),
                array(
                     'id'=>23,
                     'nodeText'=>'我的工作台23',
                     'nodeIconClass'=>'',
                     'parentId'=>2
                ),
                array(
                     'id'=>24,
                     'nodeText'=>'我的工作台24',
                     'nodeIconClass'=>'',
                     'parentId'=>2
                ),
                array(
                     'id'=>25,
                     'nodeText'=>'我的工作台25',
                     'nodeIconClass'=>'',
                     'parentId'=>2
                )
             )
         ) ,
         array(
             'id'=>3,
             'nodeText'=>'我的工作台2',
             'nodeIconClass'=>'',
             'parentId'=>1,
             'expanded'=> 'true',
             'children'=>array(
                  array(
                     'id'=>31,
                     'nodeText'=>'我的工作台31',
                     'nodeIconClass'=>'',
                     'parentId'=>3
                  ),
                  array(
                     'id'=>32,
                     'nodeText'=>'我的工作台32',
                     'nodeIconClass'=>'',
                     'parentId'=>3
                  ) ,
                  array(
                     'id'=>33,
                     'nodeText'=>'我的工作台32',
                     'nodeIconClass'=>'',
                     'parentId'=>3
                  ),
                  array(
                     'id'=>34,
                     'nodeText'=>'我的工作台32',
                     'nodeIconClass'=>'',
                     'parentId'=>3
                  ),
                  array(
                     'id'=>35,
                     'nodeText'=>'我的工作台32',
                     'nodeIconClass'=>'',
                     'parentId'=>3
                  ),
                  array(
                     'id'=>36,
                     'nodeText'=>'我的工作台32',
                     'nodeIconClass'=>'',
                     'parentId'=>3
                  )

             )
         )

     ),
     'id'=>1,
     'nodeText'=>'根节点',
     'nodeIconClass'=> ''
 );

echo json_encode($arr);
?> 