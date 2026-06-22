# DISCOVER HIDEOUT REWARD - Main Loop
# Runs every tick via minecraft:tick

execute as @a[x=801,y=67,z=235,distance=..5] unless score @s siogun.arg.discover_hideout.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Portal do Innego Świata]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Portal do Innego Świata\n","color":"green","bold":true},{"text":"Znajdź pierwsze zapiski podróżnika","color":"gray","bold":false}]}}]
execute as @a[x=801,y=67,z=235,distance=..5] unless score @s siogun.arg.discover_hideout.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a[x=801,y=67,z=235,distance=..5] unless score @s siogun.arg.discover_hideout.rewarded matches 1.. run scoreboard players set @s siogun.arg.discover_hideout.rewarded 1
