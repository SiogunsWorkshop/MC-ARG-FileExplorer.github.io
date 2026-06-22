# BOOK REWARD - Reset
# Resets all players' reward status
# Command: /function siogun:rewards/book_inventory/reset

scoreboard players set @a siogun.arg.book.rewarded 0
tellraw @s ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Book reward reset."]
