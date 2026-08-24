"""Screenshot Two Lights gold — before and after."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _shot_full import shot_full

HERE = os.path.dirname(os.path.abspath(__file__))

shot_full(os.path.join(HERE, "before.html"), os.path.join(HERE, "before.png"))
shot_full(os.path.join(HERE, "after.html"), os.path.join(HERE, "after.png"))
print("Two Lights screenshots written to", HERE)