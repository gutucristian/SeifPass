import sys

functionToCall = sys.argv[1]
arg1 = sys.argv[2]
arg2 = sys.argv[3]

def add(a, b):
    print(int(a) + int(b))
    sys.stdout.flush()

def subtract(a, b):
    print(int(a) - int(b))
    sys.stdout.flush()

if (functionToCall == "add"):
    add(arg1, arg2)

if functionToCall == "subtract":
    subtract(arg1, arg2)
