# TROPICAL FISH REWARD - Main Loop
# Runs every tick via minecraft:tick

execute as @a if entity @s[nbt={Inventory:[{id:"minecraft:tropical_fish",components:{"minecraft:custom_name":'"bul-bul-nator"'}}]}] unless score @s siogun.arg.tropical_fish.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Obce Wody]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Obce Wody\n","color":"green","bold":true},{"text":"Zbadaj podwodny pałac i znajdź zagubioną rybę.","color":"gray","bold":false}]}}]
execute as @a if entity @s[nbt={Inventory:[{id:"minecraft:tropical_fish",components:{"minecraft:custom_name":'"bul-bul-nator"'}}]}] unless score @s siogun.arg.tropical_fish.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a if entity @s[nbt={Inventory:[{id:"minecraft:tropical_fish",components:{"minecraft:custom_name":'"bul-bul-nator"'}}]}] unless score @s siogun.arg.tropical_fish.rewarded matches 1.. run scoreboard players set @s siogun.arg.tropical_fish.rewarded 1
