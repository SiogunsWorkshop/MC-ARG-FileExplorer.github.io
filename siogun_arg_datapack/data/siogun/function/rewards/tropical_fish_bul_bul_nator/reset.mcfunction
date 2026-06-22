# TROPICAL FISH REWARD - Reset
# Resets all players' reward status
# Command: /function siogun:rewards/tropical_fish_bul_bul_nator/reset

scoreboard players set @a siogun.arg.tropical_fish.rewarded 0
tellraw @s ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Tropical fish reward reset."]
