# BOOK REWARD
# Condition: player has a book named "z@ch0d" anywhere in inventory.

# Setup (run once manually)
scoreboard objectives add siogun.arg.book.rewarded dummy

# Reset (run manually when needed)
scoreboard players set @a siogun.arg.book.rewarded 0

# Award logic (run repeatedly)
execute as @a if items entity @s inventory.* minecraft:book[minecraft:custom_name='{"text":"z@ch0d"}'] unless score @s siogun.arg.book.rewarded matches 1.. run tellraw @a [{"selector":"@s","color":"white"},{"text":" Siogun odblokowuje osiągnięcie ","color":"gray"},{"text":"[Zapomniane Wspomnienia]","color":"green","hoverEvent":{"action":"show_text","contents":[{"text":"Zapomniane Wspomnienia\n","color":"green","bold":true},{"text":"Znajdź pamiętnik podróżnika zakopany na skraju wyspy.","color":"gray","bold":false}]}}]
execute as @a if items entity @s inventory.* minecraft:book[minecraft:custom_name='{"text":"z@ch0d"}'] unless score @s siogun.arg.book.rewarded matches 1.. run give @s minecraft:structure_void[minecraft:custom_name='{"text":"Reward Token"}'] 1
execute as @a if items entity @s inventory.* minecraft:book[minecraft:custom_name='{"text":"z@ch0d"}'] unless score @s siogun.arg.book.rewarded matches 1.. run scoreboard players set @s siogun.arg.book.rewarded 1
