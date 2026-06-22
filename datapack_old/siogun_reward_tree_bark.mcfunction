# TREE-BARK REWARDS near 781 164 -16

# Password: p0-Ke-m0N
# Items: p0-__-___, __-Ke-___, __-__-m0N

# Setup (run once manually)
scoreboard objectives add siogun.arg.tree_bark.any.rewarded dummy
scoreboard objectives add siogun.arg.tree_bark.all.rewarded dummy

# Reset (run manually when needed)
scoreboard players set @a siogun.arg.tree_bark.any.rewarded 0
scoreboard players set @a siogun.arg.tree_bark.all.rewarded 0

# Any-name condition: having at least one matching item anywhere in inventory.
tag @a remove siogun.arg.any.hold
execute as @a if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"p0-__-___"}'] run tag @s add siogun.arg.any.hold
execute as @a if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-Ke-___"}'] run tag @s add siogun.arg.any.hold
execute as @a if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-__-m0N"}'] run tag @s add siogun.arg.any.hold
execute as @a[tag=siogun.arg.any.hold] unless score @s siogun.arg.tree_bark.any.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Moje Drzewo]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Moje Drzewo\n","color":"green","bold":true},{"text":"Znajdź fragment klucza zapisanego na korze.","color":"gray","bold":false}]}}]
execute as @a[tag=siogun.arg.any.hold] unless score @s siogun.arg.tree_bark.any.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a[tag=siogun.arg.any.hold] unless score @s siogun.arg.tree_bark.any.rewarded matches 1.. run scoreboard players set @s siogun.arg.tree_bark.any.rewarded 1
tag @a remove siogun.arg.any.hold

# All-names condition: player has all three named tree_bark items in inventory.
execute as @a if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"p0-__-___"}'] if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-Ke-___"}'] if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-__-m0N"}'] unless score @s siogun.arg.tree_bark.all.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Mój Gaj]","color":"light_purple","hoverEvent":{"action":"show_text","contents":[{"text":"Mój Gaj\n","color":"light_purple","bold":true},{"text":"Znajdź wszystkie fragmenty klucza zapisane na kawałkach kory.","color":"gray","bold":false}]}}]
execute as @a if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"p0-__-___"}'] if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-Ke-___"}'] if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-__-m0N"}'] unless score @s siogun.arg.tree_bark.all.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 3
execute as @a if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"p0-__-___"}'] if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-Ke-___"}'] if items entity @s inventory.* farmersdelight:tree_bark[minecraft:custom_name='{"text":"__-__-m0N"}'] unless score @s siogun.arg.tree_bark.all.rewarded matches 1.. run scoreboard players set @s siogun.arg.tree_bark.all.rewarded 1
