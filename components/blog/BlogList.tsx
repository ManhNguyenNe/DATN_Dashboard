"use client";
//import node modules libraries
import { Row, Col, Nav, Tab, Badge } from "react-bootstrap";
import { useState, useTransition } from "react";

//import custom components
import PublishedBlogList from "./PublishedBlogList";
import DraftsBlogList from "./DraftsBlogList";
import ScheduledBlogList from "./ScheduledBlogList";
import Loading from "components/common/Loading";

const BlogList = () => {
  const [activeTab, setActiveTab] = useState("0");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (eventKey: string | null) => {
    if (eventKey && eventKey !== activeTab) {
      startTransition(() => {
        setActiveTab(eventKey);
      });
    }
  };

  return (
    <Row>
      <Col lg={12}>
        <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
          <Nav
            className="nav-lb-tab border-dashed border-bottom mb-6"
            id="pills-tab"
          >
            <Nav.Item>
              <Nav.Link href="" eventKey={"0"}>
                <div className="d-flex align-items-center gap-2 lh-1">
                  <span>
                    Published
                    <Badge
                      bg="gray-200"
                      text="gray-600"
                      className="rounded-circle"
                    >
                      12
                    </Badge>
                  </span>
                </div>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="" eventKey={"1"}>
                <div className="d-flex align-items-center gap-2 lh-1">
                  <span>
                    Drafts
                    <Badge
                      bg="gray-200"
                      text="gray-600"
                      className="rounded-circle"
                    >
                      3
                    </Badge>
                  </span>
                </div>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="" eventKey={"2"}>
                <div className="d-flex align-items-center gap-2 lh-1">
                  <span>
                    Scheduled
                    <Badge
                      bg="gray-200"
                      text="gray-600"
                      className="rounded-circle"
                    >
                      2
                    </Badge>
                  </span>
                </div>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content id="pills-tabContent">
            {isPending && (
              <div className="position-relative">
                <Loading size="sm" text="Đang chuyển tab..." />
              </div>
            )}

            <Tab.Pane eventKey={"0"} className={isPending ? "opacity-50" : ""}>
              <PublishedBlogList />
            </Tab.Pane>
            <Tab.Pane eventKey={"1"} className={isPending ? "opacity-50" : ""}>
              <DraftsBlogList />
            </Tab.Pane>
            <Tab.Pane eventKey={"2"} className={isPending ? "opacity-50" : ""}>
              <ScheduledBlogList />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Col>
    </Row>
  );
};

export default BlogList;
