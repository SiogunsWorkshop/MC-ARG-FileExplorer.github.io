# TROPICAL FISH REWARD
# Condition: player has a tropical fish named "bul-bul-nator" anywhere in inventory.

# Setup (run once manually)
scoreboard objectives add siogun.arg.tropical_fish.rewarded dummy

# Reset (run manually when needed)
scoreboard players set @a siogun.arg.tropical_fish.rewarded 0

# Award logic (run repeatedly)
execute as @a if items entity @s inventory.* minecraft:tropical_fish[minecraft:custom_name='{"text":"bul-bul-nator"}'] unless score @s siogun.arg.tropical_fish.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Obce Wody]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Obce Wody\n","color":"green","bold":true},{"text":"Zbadaj podwodny pałac i znajdź zagubioną rybę.","color":"gray","bold":false}]}}]
execute as @a if items entity @s inventory.* minecraft:tropical_fish[minecraft:custom_name='{"text":"bul-bul-nator"}'] unless score @s siogun.arg.tropical_fish.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a if items entity @s inventory.* minecraft:tropical_fish[minecraft:custom_name='{"text":"bul-bul-nator"}'] unless score @s siogun.arg.tropical_fish.rewarded matches 1.. run scoreboard players set @s siogun.arg.tropical_fish.rewarded 1
