# ENDER EYE REWARD (ANY)
# Condition: player has at least one matching ender eye anywhere in inventory.
# Names: "I-C" or "-U"

# Setup (run once manually)
scoreboard objectives add siogun.arg.ender_eye.hold_any.rewarded dummy

# Reset (run manually when needed)
scoreboard players set @a siogun.arg.ender_eye.hold_any.rewarded 0

# Any-name detection tag
# (temporary tag used to combine OR logic)
tag @a remove siogun.arg.ender_eye.hold_any
execute as @a if items entity @s inventory.* minecraft:ender_eye[minecraft:custom_name='{"text":"I-C"}'] run tag @s add siogun.arg.ender_eye.hold_any
execute as @a if items entity @s inventory.* minecraft:ender_eye[minecraft:custom_name='{"text":"-U"}'] run tag @s add siogun.arg.ender_eye.hold_any

# Award logic (run repeatedly)
execute as @a[tag=siogun.arg.ender_eye.hold_any] unless score @s siogun.arg.ender_eye.hold_any.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Nocne Mary]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Nocne Mary\n","color":"green","bold":true},{"text":"Znajdź oczy nocnej zmary.","color":"gray","bold":false}]}}]
execute as @a[tag=siogun.arg.ender_eye.hold_any] unless score @s siogun.arg.ender_eye.hold_any.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a[tag=siogun.arg.ender_eye.hold_any] unless score @s siogun.arg.ender_eye.hold_any.rewarded matches 1.. run scoreboard players set @s siogun.arg.ender_eye.hold_any.rewarded 1

# Cleanup temporary tag
tag @a remove siogun.arg.ender_eye.hold_any
