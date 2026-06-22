# SEAT REWARD - Reset
# Resets all players' reward status
# Command: /function siogun:rewards/seat/reset

scoreboard players set @a siogun.arg.seat.rewarded 0
tellraw @s ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Seat reward reset."]
