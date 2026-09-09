{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 9,
      "minor": 1,
      "revision": 4,
      "architecture": "arm64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      100,
      100,
      980,
      600
    ],
    "openinpresentation": 0,
    "default_fontsize": 12,
    "default_fontname": "Arial",
    "bgcolor": [
      0.025,
      0.036,
      0.06,
      1
    ],
    "boxes": [
      {
        "box": {
          "id": "left",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            20,
            20,
            120,
            22
          ],
          "text": "fftin~ 1"
        }
      },
      {
        "box": {
          "id": "right",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            180,
            20,
            120,
            22
          ],
          "text": "fftin~ 2"
        }
      },
      {
        "box": {
          "id": "shape",
          "maxclass": "newobj",
          "numinlets": 5,
          "numoutlets": 7,
          "patching_rect": [
            20,
            90,
            280,
            22
          ],
          "text": "gen~ lens_spectral"
        }
      },
      {
        "box": {
          "id": "poll",
          "maxclass": "newobj",
          "numinlets": 0,
          "numoutlets": 1,
          "patching_rect": [
            380,
            20,
            90,
            22
          ],
          "text": "in 3"
        }
      },
      {
        "box": {
          "id": "trigger",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 7,
          "patching_rect": [
            380,
            90,
            190,
            22
          ],
          "text": "t b b b b b b b"
        }
      },
      {
        "box": {
          "id": "pack",
          "maxclass": "newobj",
          "numinlets": 7,
          "numoutlets": 1,
          "patching_rect": [
            20,
            230,
            260,
            22
          ],
          "text": "pack f f f f f f f"
        }
      },
      {
        "box": {
          "id": "out",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            20,
            280,
            90,
            22
          ],
          "text": "out 1"
        }
      },
      {
        "box": {
          "id": "snap0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            140,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap2",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            260,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap3",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            380,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap4",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            500,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap5",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            620,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap6",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            740,
            160,
            100,
            22
          ],
          "text": "snapshot~"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "left",
            0
          ],
          "destination": [
            "shape",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "left",
            1
          ],
          "destination": [
            "shape",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "right",
            0
          ],
          "destination": [
            "shape",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "right",
            1
          ],
          "destination": [
            "shape",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "left",
            2
          ],
          "destination": [
            "shape",
            4
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "poll",
            0
          ],
          "destination": [
            "trigger",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            0
          ],
          "destination": [
            "snap0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            0
          ],
          "destination": [
            "snap0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap0",
            0
          ],
          "destination": [
            "pack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            1
          ],
          "destination": [
            "snap1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            1
          ],
          "destination": [
            "snap1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap1",
            0
          ],
          "destination": [
            "pack",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            2
          ],
          "destination": [
            "snap2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            2
          ],
          "destination": [
            "snap2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap2",
            0
          ],
          "destination": [
            "pack",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            3
          ],
          "destination": [
            "snap3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            3
          ],
          "destination": [
            "snap3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap3",
            0
          ],
          "destination": [
            "pack",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            4
          ],
          "destination": [
            "snap4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            4
          ],
          "destination": [
            "snap4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap4",
            0
          ],
          "destination": [
            "pack",
            4
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            5
          ],
          "destination": [
            "snap5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            5
          ],
          "destination": [
            "snap5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap5",
            0
          ],
          "destination": [
            "pack",
            5
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            6
          ],
          "destination": [
            "snap6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            6
          ],
          "destination": [
            "snap6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap6",
            0
          ],
          "destination": [
            "pack",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pack",
            0
          ],
          "destination": [
            "out",
            0
          ]
        }
      }
    ],
    "autosave": 0
  }
}
