# ENDER EYE REWARD - Main Loop
# Runs every tick via minecraft:tick

tag @a remove siogun.arg.ender_eye.hold_any
execute as @a if items entity @s inventory.* minecraft:ender_eye[minecraft:custom_name='{"text":"I-C"}'] run tag @s add siogun.arg.ender_eye.hold_any
execute as @a if items entity @s inventory.* minecraft:ender_eye[minecraft:custom_name='{"text":"-U"}'] run tag @s add siogun.arg.ender_eye.hold_any

execute as @a[tag=siogun.arg.ender_eye.hold_any] unless score @s siogun.arg.ender_eye.hold_any.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Nocne Mary]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Nocne Mary\n","color":"green","bold":true},{"text":"Znajdź oczy nocnej zmary.","color":"gray","bold":false}]}}]
execute as @a[tag=siogun.arg.ender_eye.hold_any] unless score @s siogun.arg.ender_eye.hold_any.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a[tag=siogun.arg.ender_eye.hold_any] unless score @s siogun.arg.ender_eye.hold_any.rewarded matches 1.. run scoreboard players set @s siogun.arg.ender_eye.hold_any.rewarded 1

tag @a remove siogun.arg.ender_eye.hold_any
