# TREE BARK REWARD - Main Loop
# Runs every tick via minecraft:tick

tag @a remove siogun.arg.any.hold

execute as @a if entity @s[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"p0-__-___"'}}]}] run tag @s add siogun.arg.any.hold
execute as @a if entity @s[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-Ke-___"'}}]}] run tag @s add siogun.arg.any.hold
execute as @a if entity @s[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-__-m0N"'}}]}] run tag @s add siogun.arg.any.hold

execute as @a[tag=siogun.arg.any.hold] unless score @s siogun.arg.tree_bark.any.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Moje Drzewo]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Moje Drzewo\n","color":"green","bold":true},{"text":"Znajdź fragment klucza zapisanego na korze.","color":"gray","bold":false}]}}]
execute as @a[tag=siogun.arg.any.hold] unless score @s siogun.arg.tree_bark.any.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a[tag=siogun.arg.any.hold] unless score @s siogun.arg.tree_bark.any.rewarded matches 1.. run scoreboard players set @s siogun.arg.tree_bark.any.rewarded 1

tag @a remove siogun.arg.any.hold

execute as @a if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"p0-__-___"'}}]}] if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-Ke-___"'}}]}] if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-__-m0N"'}}]}] unless score @s siogun.arg.tree_bark.all.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Mój Gaj]","color":"light_purple","hoverEvent":{"action":"show_text","contents":[{"text":"Mój Gaj\n","color":"light_purple","bold":true},{"text":"Znajdź wszystkie fragmenty klucza zapisane na kawałkach kory.","color":"gray","bold":false}]}}]
execute as @a if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"p0-__-___"'}}]}] if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-Ke-___"'}}]}] if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-__-m0N"'}}]}] unless score @s siogun.arg.tree_bark.all.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 3
execute as @a if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"p0-__-___"'}}]}] if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-Ke-___"'}}]}] if entity @p[nbt={Inventory:[{id:"farmersdelight:tree_bark",components:{"minecraft:custom_name":'"__-__-m0N"'}}]}] unless score @s siogun.arg.tree_bark.all.rewarded matches 1.. run scoreboard players set @s siogun.arg.tree_bark.all.rewarded 1
