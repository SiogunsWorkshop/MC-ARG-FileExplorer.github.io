# DISCOVER HIDEOUT REWARD - Reset
# Resets all players' reward status
# Command: /function siogun:rewards/discover_hideout/reset

scoreboard players set @a siogun.arg.discover_hideout.rewarded 0
tellraw @s ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Discover hideout reward reset."]
