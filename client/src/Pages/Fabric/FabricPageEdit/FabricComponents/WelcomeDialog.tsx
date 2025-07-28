import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  useTheme,
  Box,
  Backdrop,
  Link,
  Grid,
  Paper,
  Grid2,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fabricPageActions } from "../../FabricPageRedAct";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import design_1 from "../../../../static/images/design_1.png";
import design_2 from "../../../../static/images/design_2.png";
import design_3 from "../../../../static/images/design_3.png";
import design_4 from "../../../../static/images/design_4.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./styles.css";
import video1 from "../../../../static/videos/video1.gif";
import video2 from "../../../../static/videos/video2.gif";
import video3 from "../../../../static/videos/video3.gif";
import video4 from "../../../../static/videos/video4.gif";

interface WelcomeDialogProps {
  open: boolean;
  manualTrigger?: boolean;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({
  open,
  manualTrigger = false,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const MsgShownToday = useSelector(
    (state: any) => state.fabricPageReducer.MsgShownToday
  );
  const carouselImages = [design_1, design_2, design_3, design_4];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const pagination = {
    clickable: true,
    renderBullet: function (index, className) {
      return '<span class="' + className + '">' + (index + 1) + "</span>";
    },
  };

  const handleClose = () => {
    const today = new Date().toDateString();
    dispatch(fabricPageActions.setMsgShownToday(today));
    dispatch(fabricPageActions.setFirstVisit(false));
  };

  // Check if dialog should be shown
  const shouldShowDialog = () => {
    // If manually triggered, always show
    if (manualTrigger) return true;

    // Otherwise, check daily limit
    const today = new Date().toDateString();
    return MsgShownToday !== today;
  };

  return (
    <Backdrop
      open={open && shouldShowDialog()}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 3200,
      }}
    >
      <Dialog
        open={open && shouldShowDialog()}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "90%",
            height: "fit-content",
            maxWidth: "none",
            maxHeight: "none",
            margin: 0,
            position: "absolute",
            top: "5%",
            left: "5%",
            animation: "slideDown 0.5s ease-out",
            "@keyframes slideDown": {
              "0%": {
                transform: "translateY(-100%)",
                opacity: 0,
              },
              "100%": {
                transform: "translateY(0)",
                opacity: 1,
              },
            },
          },
          zIndex: 3201,
        }}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            return;
          }
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: theme.spacing(3),
            position: "relative",
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
                textAlign: "center",
                mb: 4,
              }}
            >
              Welcome to the Dynamic Content Designer
            </Typography>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    boxSizing: "border-box",
                  }}
                >
                  <Typography variant="h5" gutterBottom color="primary">
                    About the Platform
                  </Typography>
                  <Typography variant="body1" paragraph>
                    This powerful design platform enables you to create dynamic,
                    responsive content that adapts to any device resolution.
                    With an intuitive drag-and-drop interface, you can:
                  </Typography>
                  <ul style={{ paddingLeft: "20px" }}>
                    <li>
                      Create responsive layouts that work across all devices
                    </li>
                    <li>
                      Add dynamic widgets that display real-time device
                      information
                    </li>
                    <li>Design once and deploy everywhere</li>
                    <li>Generate optimized HTML output for any screen size</li>
                  </ul>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 6,
                      position: "relative",
                    }}
                  >
                    <Typography variant="h6" gutterBottom color="primary">
                      HTML Outputs
                    </Typography>
                    <Box
                      sx={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 2,
                      }}
                    >
                      {carouselImages.map((img, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 1,
                            cursor: "pointer",
                            "&:hover": {
                              transform: "scale(2.1)",
                              transition: "transform 0.3s ease",
                            },
                          }}
                        >
                          <img
                            src={img}
                            alt={`Example Design ${idx + 1}`}
                            style={{
                              width: "100%",
                              maxHeight: "120px",
                              objectFit: "contain",
                              borderRadius: "4px",
                              display: "block",
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h5" gutterBottom color="primary">
                    Getting Started
                  </Typography>
                  <Typography variant="body1" paragraph>
                    To begin creating your dynamic content:
                  </Typography>

                  <Box sx={{ width: "100%", height: "300px" }}>
                    <Swiper
                      slidesPerView={1}
                      loop={true}
                      autoplay={{
                        delay: 20000,
                        disableOnInteraction: false,
                      }}
                      pagination={pagination}
                      navigation={true}
                      modules={[Autoplay, Pagination, Navigation]}
                      className="mySwiper"
                    >
                      <SwiperSlide>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            1. Click and place media elements from the library
                          </Typography>
                          <img
                            src={video1}
                            alt="Click and place elements"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                      <SwiperSlide>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            2. Drag and place elements at any position
                          </Typography>
                          <img
                            src={video2}
                            alt="Drag and drop elements"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                      <SwiperSlide>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            3. Configure element properties
                          </Typography>
                          <img
                            src={video3}
                            alt="Configure properties"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                      <SwiperSlide>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            4. Experiment with different layouts
                          </Typography>
                          <img
                            src={video4}
                            alt="Experiment with layouts"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                    </Swiper>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(255, 193, 7, 0.1)",
                      borderRadius: 1,
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      color: "warning.dark",
                    }}
                  >
                    <strong>Demo Version Notice:</strong> This is a
                    demonstration version of the Dynamic Content Designer. Some
                    features, including preview and export functionality, are
                    disabled as this is part of a larger application ecosystem.
                    The full version includes additional capabilities for
                    previewing and exporting designs.
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                      borderRadius: 1,
                      border: "1px solid rgba(76, 175, 80, 0.3)",
                      color: "success.dark",
                    }}
                  >
                    <strong>Coming Soon:</strong> HTML preview functionality
                    will be available in the next update, allowing you to see
                    your designs rendered as actual HTML output in real-time.
                  </Typography>
                </Paper>
              </Grid2>
            </Grid2>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: theme.spacing(2),
              borderTop: `1px solid ${theme.palette.divider}`,
              mt: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Link
                href="https://www.linkedin.com/in/dimitrios-mermigkas/"
                target="_blank"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              >
                <LinkedInIcon sx={{ mr: 1 }} />
                <Typography>LinkedIn</Typography>
              </Link>
              <Link
                href="https://github.com/DimitrisMermigkas"
                target="_blank"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              >
                <GitHubIcon sx={{ mr: 1 }} />
                <Typography>GitHub</Typography>
              </Link>
              <Link
                href="#"
                target="_blank"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": { color: theme.palette.primary.dark },
                }}
              >
                <LanguageIcon sx={{ mr: 1 }} />
                <Typography>Portfolio (Coming Soon)</Typography>
              </Link>
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{
                minWidth: "200px",
                textTransform: "none",
                borderRadius: "20px",
                boxShadow: 3,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 6,
                },
                transition: "all 0.3s ease",
              }}
            >
              Let's Get Started
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Fullscreen Picture Dialog */}
      <Dialog
        open={open && shouldShowDialog()}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "90%",
            height: "fit-content",
            maxWidth: "none",
            maxHeight: "none",
          },
        }}
      >
        <DialogContent>
          <img src={selectedImage} alt="Fullscreen Picture" />
        </DialogContent>
      </Dialog>
    </Backdrop>
  );
};

export default WelcomeDialog;
