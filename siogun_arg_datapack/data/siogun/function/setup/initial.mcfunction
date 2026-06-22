# INITIAL SETUP - Run this once after installing the datapack
# /function siogun:setup/initial

# Call all setup functions
function siogun:rewards/ender_eye_hold_any/setup
function siogun:rewards/book_inventory/setup
function siogun:rewards/seat/setup
function siogun:rewards/tree_bark/setup
function siogun:rewards/tropical_fish_bul_bul_nator/setup
function siogun:rewards/discover_hideout/setup

# Notify
tellraw @a ["",{"text":"[Siogun ARG]","color":"gold","bold":true}," Datapack initialized successfully. The reward system is now active and will check for rewards every tick!"]
