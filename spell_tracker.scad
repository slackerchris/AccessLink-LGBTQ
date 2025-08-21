// Fantasy Spell Tracker - OpenSCAD Model
// Breaking down the components step by step

// === PARAMETERS ===
// Main dimensions (we'll refine these as we go)
base_width = 60;
base_depth = 40;
base_height = 8;

tower_width = 20;
tower_depth = 15;
tower_height = 80;

card_slot_width = 12;
card_slot_height = 16;
card_slot_depth = 2;

// === MODULE DEFINITIONS ===

// Base platform with stone texture
module base_platform() {
    difference() {
        // Main base
        cube([base_width, base_depth, base_height]);
        
        // Add some simple stone texture later
        // For now, just create the basic shape
    }
}

// Main tower structure with dice tower ramps
module main_tower() {
    difference() {
        // Outer tapered tower shell
        hull() {
            // Bottom - full size
            cube([tower_width, tower_depth, 1]);
            
            // Top - smaller size for taper
            translate([tower_width * 0.15, tower_depth * 0.15, tower_height])
                cube([tower_width * 0.7, tower_depth * 0.7, 1]);
        }
        
        // Hollow interior for dice path
        translate([2, 2, 1])
            hull() {
                // Bottom interior
                cube([tower_width - 4, tower_depth - 4, 1]);
                
                // Top interior (smaller)
                translate([tower_width * 0.15 - 2, tower_depth * 0.15 - 2, tower_height - 2])
                    cube([tower_width * 0.7 - 0, tower_depth * 0.7 - 0, 1]);
            }
    }
    
    // Internal baffles for dice bouncing - properly contained within tower walls
    // All elements guaranteed to be inside the hollow interior
    
    // Baffle 1 - Left wall step (properly sized and positioned)
    translate([2.5, 5, tower_height * 0.75])
        cube([6, 1.5, tower_height * 0.08]);
    
    // Baffle 2 - Right wall step (properly sized and positioned)  
    translate([11, tower_depth - 4, tower_height * 0.6])
        cube([6, 1.5, tower_height * 0.08]);
    
    // Baffle 3 - Back wall step (properly sized and positioned)
    translate([7, tower_depth - 2.5, tower_height * 0.45])
        cube([4, 1.5, tower_height * 0.08]);
    
    // Baffle 4 - Front wall step (properly sized and positioned)
    translate([4, 2.5, tower_height * 0.3])
        cube([6, 1.5, tower_height * 0.08]);
    
    // Baffle 5 - Left wall step (properly sized and positioned)
    translate([2.5, 7, tower_height * 0.15])
        cube([5, 1.5, tower_height * 0.08]);
    
    // Small deflector ramps - carefully positioned inside walls
    // Ramp 1 - gentle slope, well within bounds
    translate([8, 6, tower_height * 0.7])
        rotate([0, -25, 30])
            cube([3, 0.8, 0.8]);
    
    // Ramp 2 - gentle slope, well within bounds
    translate([6, tower_depth - 5, tower_height * 0.5])
        rotate([0, -25, -30])
            cube([3, 0.8, 0.8]);
    
    // Ramp 3 - gentle slope, well within bounds
    translate([10, 4, tower_height * 0.25])
        rotate([0, -25, 60])
            cube([2.5, 0.8, 0.8]);
}

// Individual card slot holders (the modular pieces on the right)
module card_slot_holder() {
    difference() {
        // Outer frame
        cube([card_slot_width + 4, card_slot_height + 4, 4]);
        
        // Card slot cutout
        translate([2, 2, 1])
            cube([card_slot_width, card_slot_height, 3]);
    }
}

// === ASSEMBLY ===
module spell_tracker_v1() {
    // Base platform - COMMENTED OUT FOR TOWER FOCUS
    // base_platform();
    
    // Main tower positioned on the base
    // translate([5, base_depth/2 - tower_depth/2, base_height])
        main_tower();
    
    // Card holders - COMMENTED OUT FOR TOWER FOCUS
    // for (i = [0:5]) {
    //     translate([tower_width + 15, base_depth/2 - card_slot_height/2, base_height + (i * 18)])
    //         card_slot_holder();
    // }
}

// === RENDER ===
spell_tracker_v1();

// === NOTES FOR NEXT ITERATIONS ===
/*
TODO for future versions:
1. Add ornate details to the main tower (the blue decorative elements)
2. Create stone texture on the base
3. Add the pointed/pyramid top
4. Model the individual card icons/symbols
5. Add connection mechanisms between card holders
6. Refine dimensions based on actual measurements needed
7. Add the decorative border around the base
*/
