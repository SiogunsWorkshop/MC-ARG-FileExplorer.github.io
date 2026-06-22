# SEAT REWARD - Main Loop
# Runs every tick via minecraft:tick

execute as @a[x=781,y=164,z=-16,distance=..5] unless score @s siogun.arg.seat.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Samotny Świerk]","color":"light_purple","hoverEvent":{"action":"show_text","contents":[{"text":"Samotny Świerk\n","color":"light_purple","bold":true},{"text":"Odpocznij przy samotnym świerku. Twoja podróż dobiegła końca.","color":"gray","bold":false}]}}]
execute as @a[x=781,y=164,z=-16,distance=..5] unless score @s siogun.arg.seat.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 3
execute as @a[x=781,y=164,z=-16,distance=..5] unless score @s siogun.arg.seat.rewarded matches 1.. run scoreboard players set @s siogun.arg.seat.rewarded 1
