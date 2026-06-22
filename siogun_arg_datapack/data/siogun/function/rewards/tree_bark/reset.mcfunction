# TREE BARK REWARD - Reset
# Resets all players' reward status
# Command: /function siogun:rewards/tree_bark/reset

scoreboard players set @a siogun.arg.tree_bark.any.rewarded 0
scoreboard players set @a siogun.arg.tree_bark.all.rewarded 0
tellraw @s ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Tree bark reward reset."]
