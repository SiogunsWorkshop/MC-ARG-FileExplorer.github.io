# ENDER EYE REWARD - Reset
# Resets all players' reward status
# Command: /function siogun:rewards/ender_eye_hold_any/reset

scoreboard players set @a siogun.arg.ender_eye.hold_any.rewarded 0
tellraw @s ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Ender Eye reward reset."]
